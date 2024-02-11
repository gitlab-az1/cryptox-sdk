import { isPlainObject } from 'typesdk/utils/is';

import { hmac } from '../hash';
import { Exception } from '../errors';
import SymmetricKey from './SymmetricKey';
import { isBrowser } from '../_internal/utils';
import XBuffer from '../_internal/resources/buffer';
import { type Decrypted, LegacyCipher } from './core';


export type SupportedAESVariants = 'aes-128-cbc' | 'aes-128-gcm' | 'aes-256-cbc' | 'aes-256-gcm';

async function _aesEncryptIV(algorithm: SupportedAESVariants, data: Uint8Array, key: Uint8Array, iv: Uint8Array): Promise<XBuffer> {
  const sign = await hmac(data, key.subarray(0, 8), 'sha512');
  const payload = XBuffer.fromString(`${XBuffer.fromUint8Array(sign).toString('hex')}$::$${XBuffer.fromUint8Array(data).toString()}`).buffer;

  const _nodeEncrypt = async () => {
    const { createCipheriv } = await import('crypto');

    return new Promise<XBuffer>((resolve, reject) => {
      try {
        const cipher = createCipheriv(algorithm,
          key, iv);
  
        const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);
        cipher.destroy();

        resolve(XBuffer.fromNodeBuffer(encrypted));
      } catch (err: any) {
        reject(err);
      }
    });
  };

  if(!isBrowser() && typeof Buffer !== 'undefined') return _nodeEncrypt();

  const crypto = typeof window.crypto !== 'undefined' ? window.crypto : null;
  const subtle = !!crypto && typeof window.crypto.subtle !== 'undefined' ? window.crypto.subtle : null;
  
  if(!subtle) {
    throw new Error('WebCrypto is not supported in this environment.');
  }

  const impKey = await subtle.importKey('raw', key, { name: 'AES-CBC' }, false, ['encrypt']);
  const output = await subtle.encrypt({ name: 'AES-CBC', iv: iv }, impKey, payload);

  return XBuffer.fromUint8Array(new Uint8Array(output));
}

async function _aesEncrypt(data: Uint8Array, key: Uint8Array): Promise<XBuffer> {
  const { encrypt } = (await import('crypto-js')).AES;
  const sign = await hmac(data, key.subarray(0, 8), 'sha512');

  const payload = XBuffer.fromString(`${XBuffer.fromUint8Array(sign).toString('hex')}$::$${XBuffer.fromUint8Array(data).toString()}`).toString();
  
  const output = encrypt(payload,
    XBuffer.fromUint8Array(key).toString()).toString();

  return XBuffer.fromString(output);
}


async function _aesDecryptIV(algorithm: SupportedAESVariants, data: Uint8Array, key: Uint8Array, iv: Uint8Array): Promise<[XBuffer, XBuffer]> {
  const _nodeDecrypt = async () => {
    const { createDecipheriv } = await import('crypto');
    
    return new Promise<[XBuffer, XBuffer]>((resolve, reject) => {
      try {
        const decipher = createDecipheriv(algorithm, key, iv);
        const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
        decipher.destroy();

        const str = XBuffer.fromNodeBuffer(decrypted).toString('utf-8');
        if(str.indexOf('$::$') < 0) return reject( new Error('Malformed encrypted data. It does not contain the HMAC signature.'));

        const [signature, payload] = str.split('$::$').map(item => item.trim());

        hmac(XBuffer.fromString(payload).buffer, key.subarray(0, 8), 'sha512').then(sign => {
          const hexSignature = XBuffer.fromUint8Array(sign).toString('hex');

          if(hexSignature !== signature) return reject(new Error('Invalid HMAC signature. The data has been tampered with.'));
          resolve([
            XBuffer.fromUint8Array(sign),
            XBuffer.fromString(payload),
          ]);
        }).catch(reject);
      } catch (err: any) {
        reject(err);
      }
    });
  };
    
  if(!isBrowser() && typeof Buffer !== 'undefined') return _nodeDecrypt();
    
  const crypto = typeof window.crypto !== 'undefined' ? window.crypto : null;
  const subtle = !!crypto && typeof window.crypto.subtle !== 'undefined' ? window.crypto.subtle : null;
    
  if(!subtle) {
    throw new Error('WebCrypto is not supported in this environment.');
  }
    
  const impKey = await subtle.importKey('raw', key, { name: 'AES-CBC' }, false, ['decrypt']);
  const output = await subtle.decrypt({ name: 'AES-CBC', iv: iv }, impKey, data);
    
  const str = XBuffer.fromUint8Array(new Uint8Array(output)).toString();

  if(str.indexOf('$::$') < 0) {
    throw new Error('Malformed encrypted data. It does not contain the HMAC signature.');
  }

  const [signature, payload] = str.split('$::$').map(item => item.trim());
  const sign = await hmac(XBuffer.fromString(payload).buffer, key.subarray(0, 8), 'sha512');

  const hexSignature = XBuffer.fromUint8Array(sign).toString('hex');

  if(hexSignature !== signature) {
    throw new Error('Invalid HMAC signature. The data has been tampered with.');
  }

  return [XBuffer.fromUint8Array(sign), XBuffer.fromString(payload)];
}

async function _aesDecrypt(data: Uint8Array, key: Uint8Array): Promise<[XBuffer, XBuffer]> {
  const { AES: { decrypt }, enc } = await import('crypto-js');

  const decrypted = decrypt(XBuffer.fromUint8Array(data).toString(),
    XBuffer.fromUint8Array(key).toString()).toString(enc.Utf8);

  if(decrypted.indexOf('$::$') < 0) {
    throw new Error('Malformed encrypted data. It does not contain the HMAC signature.');
  }

  const [signature, payload] = decrypted.split('$::$').map(item => item.trim());

  const sign = await hmac(XBuffer.fromString(payload).buffer, key.subarray(0, 8), 'sha512');
  const hexSignature = XBuffer.fromUint8Array(sign).toString('hex');

  if(hexSignature !== signature) {
    throw new Error('Invalid HMAC signature. The data has been tampered with.');
  }

  return [XBuffer.fromUint8Array(sign), XBuffer.fromString(payload)];
}



export class AES implements LegacyCipher {
  readonly #key: SymmetricKey;
  #unsafeMode: boolean = false;

  constructor(key: Uint8Array | SymmetricKey, algorithm: SupportedAESVariants) {
    this.#key = SymmetricKey.wrap(key, { algorithm });

    if(this.#key.algorithm.toLowerCase().indexOf('aes') < 0) {
      throw new Exception('Invalid algorithm for AES', 'Invalid Algorithm');
    }
  }

  public noUseIVCipher(): void {
    this.#unsafeMode = true;
  }

  #DoEncryption(data: any): Promise<XBuffer> {
    if(typeof data === 'object' && !isPlainObject(data)) {
      throw new Exception(`Cannot encrypt instance of ${data.constructor.name}`, 'Invalid data type');
    }

    try {
      data = XBuffer.fromString(JSON.stringify(data)).buffer;
    } catch (err: any) {
      throw new Exception(err.message, 'Non serializable data');
    }

    if(this.#unsafeMode === true) return _aesEncrypt(data, this.#key.key);

    const iv = this.#key.generateInitializationVector();
    return _aesEncryptIV(this.#key.algorithm as SupportedAESVariants, data, this.#key.key, iv);
  }

  public encrypt(data: any): Promise<XBuffer> {
    return this.#DoEncryption(data);
  }

  async #DoDecryption<T>(data: Uint8Array): Promise<Decrypted<T>> {
    let sign: XBuffer;
    let paylaod: XBuffer;

    if(this.#unsafeMode === true) {
      [sign, paylaod] = await _aesDecrypt(data, this.#key.key);
    } else {
      const iv = this.#key.generateInitializationVector();
      [sign, paylaod] = await _aesDecryptIV(this.#key.algorithm as SupportedAESVariants,
        data, this.#key.key, iv);
    }

    return Object.freeze({
      payload: JSON.parse(paylaod.toString('utf-8')) as T,
      signature: sign.buffer,
      timestamp: Date.now(),
    });
  }

  public decrypt<T = any>(data: Uint8Array): Promise<Decrypted<T>> {
    return this.#DoDecryption<T>(data);
  }

  public get key(): SymmetricKey {
    return this.#key;
  }

  public [Symbol.toStringTag]() {
    return '[object AES]';
  }
}

export default AES;
