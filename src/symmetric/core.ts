import SymmetricKey from './SymmetricKey';
import XBuffer from '../_internal/resources/buffer';


export const enum Algorithm {
  AES_256_CBC,
  AES_256_GCM,
  AES_256_CBC_HMAC_SHA512,
  CHACHA20_POLY1305,
  AES_128_CBC,
  AES_128_GCM
}


export type SymmetricAlgorithm = 
  | 'aes-128-cbc'
  | 'aes-128-gcm'
  | 'aes-256-cbc'
  | 'aes-256-gcm'
  | 'aes-256-cbc-hmac-sha512'
  | 'chacha20-poly1305';

  

export interface Decrypted<T> {
  readonly payload: T;
  readonly signature: Uint8Array;
  readonly timestamp: number;
}

export interface LegacyCipher {
  readonly key: SymmetricKey;
  encrypt(data: any): Promise<XBuffer>;
  decrypt<T>(data: Uint8Array): Promise<Decrypted<T>>;
}


export function parseAlgorithmToEnum(value: any): Algorithm {
  if(!['number', 'string'].includes(typeof value)) {
    throw new Error('Algorithm must be a string or a number');
  }

  if(typeof value === 'number') return value;

  switch(value) {
    case 'aes-128-cbc':
      return Algorithm.AES_128_CBC;
    case 'aes-128-gcm':
      return Algorithm.AES_128_GCM;
    case 'aes-256-cbc':
      return Algorithm.AES_256_CBC;
    case 'aes-256-gcm':
      return Algorithm.AES_256_GCM;
    case 'aes-256-cbc-hmac-sha512':
      return Algorithm.AES_256_CBC_HMAC_SHA512;
    case 'chacha20-poly1305':
      return Algorithm.CHACHA20_POLY1305;
    default:
      throw new Error(`Unsupported algorithm: ${value}`);
  }
}
