import { isPlainObject } from 'typesdk/utils/is';

import { hmac } from '../hash';
import { Exception } from '../errors';
import SymmetricKey from './SymmetricKey';
import { isBrowser } from '../_internal/utils';
import { Decrypted, LegacyCipher } from './core';
import XBuffer from '../buffer';


export class ChaCha20 implements LegacyCipher {
  readonly #Key: SymmetricKey;

  constructor(key: Uint8Array | SymmetricKey) {
    if(isBrowser()) {
      throw new Error('ChaCha20 is not supported in this environment.');
    }

    this.#Key = SymmetricKey.wrap(key, { algorithm: 'chacha20-poly1305' });
  }

  async #DoEncryption(data: any): Promise<XBuffer> {
    if(typeof data === 'object' && !isPlainObject(data)) {
      throw new Exception(`Cannot encrypt instance of ${data.constructor.name}`, 'Invalid data type');
    }

    try {
      data = XBuffer.fromString(JSON.stringify(data)).buffer;
    } catch (err: any) {
      throw new Exception(err.message, 'Non serializable data');
    }

    const { createCipheriv } = await import('crypto');
    const cipher = createCipheriv('chacha20-poly1305',
      this.#Key.key, this.#Key.generateInitializationVector(12));

    const sign = await hmac(data as Uint8Array, this.#Key.key.subarray(0, 8), 'sha512');
    const payload = XBuffer.fromString(`${XBuffer.fromUint8Array(sign).toString('hex')}$::$${XBuffer.fromUint8Array(data).toString()}`).buffer;

    const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);
    cipher.destroy();

    return XBuffer.fromNodeBuffer(encrypted);
  }

  public async encrypt(data: any): Promise<XBuffer> {
    return this.#DoEncryption(data);
  }

  async #DoDecryption<T>(data: Uint8Array): Promise<Decrypted<T>> {
    const { createDecipheriv } = await import('crypto');
    
    const decipher = createDecipheriv('chacha20-poly1305',
      this.#Key.key, this.#Key.generateInitializationVector(12));

    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    decipher.destroy();

    const str = XBuffer.fromNodeBuffer(decrypted).toString('utf-8');
    
    if(str.indexOf('$::$') < 0) {
      throw new Error('Invalid HMAC signature. The data has been tampered with.');
    }

    const [signature, payload] = str.split('$::$').map(item => item.trim());
    const sign = await hmac(XBuffer.fromString(payload).buffer,
      this.#Key.key.subarray(0, 8), 'sha512');

    const hexSignature = XBuffer.fromUint8Array(sign).toString('hex');

    if(hexSignature !== signature) {
      throw new Error('Invalid HMAC signature. The data has been tampered with.');
    }

    const signBuffer = XBuffer.fromUint8Array(sign);
    const paylaodBuffer = XBuffer.fromString(payload);

    return Object.freeze({
      payload: JSON.parse(paylaodBuffer.toString('utf-8')) as T,
      signature: signBuffer.buffer,
      timestamp: Date.now(),
    } satisfies Decrypted<T>);
  }

  public async decrypt<T = any>(data: Uint8Array): Promise<Decrypted<T>> {
    return this.#DoDecryption<T>(data);
  }

  public get key(): SymmetricKey {
    return this.#Key;
  }

  public [Symbol.toStringTag]() {
    return '[object ChaCha20]';
  }
}

export default ChaCha20;
