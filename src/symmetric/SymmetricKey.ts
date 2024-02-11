import type { Dict } from 'typesdk/types';

import { Exception } from '../errors';
import XBuffer from '../_internal/resources/buffer';
import { Algorithm, type SymmetricAlgorithm, parseAlgorithmToEnum } from './core';


export type KeyUsage = 
  | 'encrypt'
  | 'decrypt'
  | 'wrapKey'
  | 'unwrapKey'
  | 'deriveKey'
  | 'deriveBits'
  | 'sign'
  | 'verify';

export type SymmetricKeyOptions = {
  algorithm?: SymmetricAlgorithm | Algorithm | {
    name: SymmetricAlgorithm | Omit<string, SymmetricAlgorithm>;
    length?: number;
  };
  usages?: KeyUsage[];
}

export class SymmetricKey {
  public static wrap(key: Uint8Array | SymmetricKey, options?: SymmetricKeyOptions): SymmetricKey {
    if(key instanceof SymmetricKey) return key;
    return new SymmetricKey(key, options);
  }

  #options: SymmetricKeyOptions;
  readonly #original: Uint8Array;

  public readonly key: Uint8Array;
  public readonly hmacKey?: Uint8Array;
  public readonly encKey?: Uint8Array;
  public readonly algorithm: SymmetricAlgorithm;
  public readonly length: number;

  public readonly keyB64: string;
  public readonly encKeyB64: string;
  public readonly macKeyB64: string;

  public readonly metadata: Dict<any>;
  public readonly usages: readonly KeyUsage[];


  constructor(key: Uint8Array, options?: SymmetricKeyOptions) {
    if(!key) {
      throw new Exception('You must provide a encryption key', 'No key provided');
    }

    this.#options = options ?? {};
    const alg = parseAlgorithmToEnum(typeof this.#options?.algorithm === 'object' ?
      this.#options?.algorithm.name : this.#options?.algorithm);

    switch(alg) {
      case Algorithm.AES_128_CBC:
        this.algorithm = 'aes-128-cbc';
        this.length = 128 / 8;
        break;
      case Algorithm.AES_256_CBC:
        this.algorithm = 'aes-256-cbc';
        this.length = 256 / 8;
        break;
      case Algorithm.AES_128_GCM:
        this.algorithm = 'aes-128-gcm';
        this.length = 128 / 8;
        break;
      case Algorithm.AES_256_CBC_HMAC_SHA512:
        this.algorithm = 'aes-256-cbc-hmac-sha512';
        this.length = 256 / 8;
        break;
      case Algorithm.AES_256_GCM:
        this.algorithm = 'aes-256-gcm';
        this.length = 256 / 8;
        break;
      case Algorithm.CHACHA20_POLY1305:
        this.algorithm = 'chacha20-poly1305';
        this.length = 256 / 8;
        break;
      default:
        if(typeof options?.algorithm !== 'object') {
          throw new Error(`Unsupported algorithm: ${alg}`);
        }

        if(!options?.algorithm.length) {
          throw new Error(`Unsupported algorithm: ${alg}`);
        }

        this.algorithm = alg;
        this.length = options.algorithm.length;
    }

    if(key.byteLength > this.length) {
      this.key = key.slice(0, this.length);
      this.hmacKey = key.slice(this.length);
    } else {
      this.key = key;
    }

    this.#original = key;

    // eslint-disable-next-line no-extra-boolean-cast
    if(!!this.key) {
      this.keyB64 = XBuffer.fromUint8Array(this.key).toString('base64');
    }

    // eslint-disable-next-line no-extra-boolean-cast
    if(!!this.hmacKey) {
      this.macKeyB64 = XBuffer.fromUint8Array(this.hmacKey).toString('base64');
    }

    // eslint-disable-next-line no-extra-boolean-cast
    if(!!this.encKey) {
      this.encKeyB64 = XBuffer.fromUint8Array(this.encKey).toString('base64');
    }

    const u = this.#options?.usages ?? ['encrypt', 'decrypt'];
    this.usages = Object.freeze(u);
  }

  public get options(): SymmetricKeyOptions {
    return { ...this.#options };
  }

  public get original(): Uint8Array {
    return new Uint8Array(this.#original);
  }

  public get isLengthLessThanRequired(): boolean {
    return this.#original.byteLength <= this.length;
  }

  public generateInitializationVector(stopLength?: number): Uint8Array {
    const output = new Uint8Array(this.length / 2);

    for(let i = 0; i < output.length; i++) {
      output[i] = this.#original[i] ^ this.#original[i + this.length / 2];
    }

    if(!stopLength || stopLength < 1) return output;
    if(output.length > stopLength) return output.slice(0, stopLength);

    for(let i = output.length; i < stopLength; i++) {
      output[i] = this.#original[i % output.length] & 0xff | 0x80;
    }

    return output;
  }
}

export default SymmetricKey;
