import math from 'typesdk/math';

import { hmac } from './hash';
import { isBrowser } from './_internal/utils';


/**
 * Generates cryptographically secure random values into the provided Uint8Array.
 * 
 * If the crypto API is available, it uses `crypto.getRandomValues`, else it generates
 * random values using a custom math library.
 * 
 * @param bucket - The Uint8Array to fill with random values.
 * @returns A Uint8Array filled with random values.
 */
export function getRandomValues(bucket: Uint8Array): Uint8Array {
  if(typeof crypto !== 'undefined' &&
    typeof crypto === 'object' &&
    typeof crypto.getRandomValues === 'function') return crypto.getRandomValues(bucket);
  
  for(let i = 0; i < bucket.length; i++) {
    bucket[i] = math.random.uniform(0, 256, 'floor');
  }

  return bucket;
}


/**
 * Concatenates two Uint8Array objects into a single Uint8Array.
 * 
 * @param arr1 - The first Uint8Array to concatenate.
 * @param arr2 - The second Uint8Array to concatenate.
 * @returns A new Uint8Array containing the concatenated values of arr1 and arr2.
 */
export function concatArrays(arr1: Uint8Array, arr2: Uint8Array): Uint8Array {
  const result = new Uint8Array(arr1.length + arr2.length);

  result.set(arr1);
  result.set(arr2, arr1.length);
  
  return result;
}


/**
 * Converts a number to a Uint8Array representing its binary representation.
 * 
 * @param value - The number to convert.
 * @returns A Uint8Array representing the binary representation of the input number.
 */
export function intToByteArray(value: number): Uint8Array {
  const bytes = new Uint8Array(8);
  
  for(let i = 7; i >= 0; i--) {
    bytes[i] = value & 0xff;
    value >>= 8;
  }

  return bytes;
}


/**
 * Converts a number to an array of bytes representing its binary representation.
 * 
 * @param value - The number to convert.
 * @returns An array of bytes representing the binary representation of the input number.
 */
export function intToBytes(value: number): number[] {
  const bytes = [];

  for(let i = 8; i > 0; i--) {
    bytes.push(value & 0xff);
    value >>= 8;
  }

  return bytes.reverse();
}


/**
 * Converts a number to its binary representation based on the specified encoding.
 * 
 * @param value - The number to convert.
 * @param encoding - The encoding type ('bytes' or 'bytearray').
 * @returns An array of bytes or a Uint8Array representing the binary representation of the input number.
 * @throws Error if the encoding type is unknown.
 */
export function intToBinary(value: number, encoding: 'bytes'): number[];

/**
 * Converts a number to its binary representation based on the specified encoding.
 * 
 * @param value - The number to convert.
 * @param encoding - The encoding type ('bytes' or 'bytearray').
 * @returns An array of bytes or a Uint8Array representing the binary representation of the input number.
 * @throws Error if the encoding type is unknown.
 */
export function intToBinary(value: number, encoding: 'bytearray'): Uint8Array;

/**
 * Converts a number to its binary representation based on the specified encoding.
 * 
 * @param value - The number to convert.
 * @param encoding - The encoding type ('bytes' or 'bytearray').
 * @returns An array of bytes or a Uint8Array representing the binary representation of the input number.
 * @throws Error if the encoding type is unknown.
 */
export function intToBinary(value: number, encoding: 'bytes' | 'bytearray'): number[] | Uint8Array {
  if(encoding === 'bytes') return intToBytes(value);
  if(encoding === 'bytearray') return intToByteArray(value);

  throw new Error(`Unknown encoding: ${encoding}`);
}


/**
 * Computes the HMAC-SHA1 message authentication code using the provided key and message.
 * 
 * @param key - The key for HMAC calculation.
 * @param message - The message for HMAC calculation.
 * @returns A Uint8Array representing the HMAC-SHA1 hash.
 */
export function hmacSHA1(key: Uint8Array, message: Uint8Array): Uint8Array {
  const blockSize = 0x40;

  const ipad = new Uint8Array(blockSize);
  const opad = new Uint8Array(blockSize);

  for(let i = 0; i < blockSize; i++) {
    ipad[i] = key[i] ^ 0x36; // 0x36 = 0b00110110
    opad[i] = key[i] ^ 0x5C; // 0x5C = 0b01011100
  }

  const innerHash = sha1(concatArrays(ipad, message));
  const outerHash = sha1(concatArrays(opad, innerHash));

  return outerHash;
}


/**
 * Performs a circular left shift (rotate left) operation on a number.
 * 
 * @param n - The number to perform the rotation on.
 * @param s - The number of bits to rotate by.
 * @returns The result of the rotation operation.
 */
export function rotl(n: number, s: number): number {
  return (n << s) | (n >>> (32 - s));
}


/**
 * Computes the SHA-1 hash of the provided message.
 * 
 * @param message - The message to hash.
 * @returns A Uint8Array representing the SHA-1 hash of the message.
 */
export function sha1(message: Uint8Array): Uint8Array {
  const words = new Uint32Array([
    0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0,
  ]);

  const buffer = new ArrayBuffer(0x40);
  const view = new DataView(buffer);
  const blocks = new Uint32Array(buffer);

  let byteIndex = 0;
  const byteCount = message.length;

  for(let i = 0; i < byteCount; i++) {
    view.setUint8(byteIndex++, message[i]);
  }

  blocks[byteCount >> 2] |= 0x80 << (24 - (byteCount % 4) * 8);
  blocks[(((byteCount + 8) >> 6) << 4) + 15] = byteCount * 8;

  for(let blockIndex = 0; blockIndex < blocks.length; blockIndex += 16) {
    let a = words[0];
    let b = words[1];
    let c = words[2];
    let d = words[3];
    let e = words[4];

    for(let i = 0; i < 80; i++) {
      let f: number;
      let k: number;

      if(i < 20) {
        f = (b & c) | ((~b) & d);
        k = 0x5A827999;
      } else if(i < 40) {
        f = b ^ c ^ d;
        k = 0x6ED9EBA1;
      } else if(i < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8F1BBCDC;
      } else {
        f = b ^ c ^ d;
        k = 0xCA62C1D6;
      }

      const temp = (rotl(a, 5) + f + e + k + blocks[blockIndex + (i < 16 ? i : (i % 16))]) >>> 0;

      e = d;
      d = c;

      c = rotl(b, 30);

      b = a;
      a = temp;
    }

    words[0] = (words[0] + a) >>> 0;
    words[1] = (words[1] + b) >>> 0;
    words[2] = (words[2] + c) >>> 0;
    words[3] = (words[3] + d) >>> 0;
    words[4] = (words[4] + e) >>> 0;
  }

  const hash = new Uint8Array(20);

  for(let i = 0; i < 5; i++) {
    hash[i * 4] = (words[i] >>> 24) & 0xFF;
    hash[i * 4 + 1] = (words[i] >>> 16) & 0xFF;
    hash[i * 4 + 2] = (words[i] >>> 8) & 0xFF;
    hash[i * 4 + 3] = words[i] & 0xFF;
  }

  return hash;
}


/**
 * Decodes a Base32 encoded string into a Uint8Array.
 * 
 * @param encoded - The Base32 encoded string to decode.
 * @returns A Uint8Array representing the decoded data.
 * @throws Error if the input contains invalid Base32 characters.
 */
export function base32Decode(encoded: string): Uint8Array {
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const lookup = new Uint8Array(256);

  for(let i = 0; i < base32Chars.length; i++) {
    lookup[base32Chars.charCodeAt(i)] = i;
  }

  const padding = encoded.endsWith('=') ? (encoded.endsWith('==') ? 2 : 1) : 0;
  const byteCount = (encoded.length * 5 / 8) - padding;
  const buffer = new Uint8Array(byteCount);

  let bits = 0, value = 0, index = 0;

  for(let i = 0; i < encoded.length; i++) {
    const charValue = lookup[encoded.charCodeAt(i)];

    if(!charValue || charValue == undefined || charValue == null) {
      throw new Error('Invalid base32 character');
    }

    value = (value << 5) | charValue;
    bits += 5;

    if(bits >= 8) {
      buffer[index++] = (value >> (bits - 8)) & 0xFF;
      bits -= 8;
    }
  }

  return buffer;
}


/**
 * Performs a binary comparison between two Uint8Arrays.
 * 
 * @param a - The first Uint8Array to compare.
 * @param b - The second Uint8Array to compare.
 * @returns {boolean} - True if the arrays are equal, false otherwise.
 */
export function binaryCompare(a: Uint8Array, b: Uint8Array): boolean {
  if(a.length !== b.length) return false;
    
  let result = 0;
    
  for(let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
    
  return result === 0;
}


/**
 * Performs a deep comparison between two Uint8Arrays using HMAC.
 * 
 * @param a - The first Uint8Array to compare.
 * @param b - The second Uint8Array to compare.
 * @returns {Promise<boolean>} - A promise resolving to true if the arrays are equal, false otherwise.
 */
export async function deepCompare(a: Uint8Array, b: Uint8Array): Promise<boolean> {
  const key = await randomBytes(32);

  const mac1 = await hmac(a, key, 'sha256');
  const mac2 = await hmac(b, key, 'sha256');

  if(mac1.byteLength !== mac2.byteLength) return false;

  const arr1 = new Uint8Array(mac1);
  const arr2 = new Uint8Array(mac2);

  for(let i = 0; i < arr2.length; i++) {
    if(arr1[i] !== arr2[i]) return false;
  }

  return true;
}


/**
 * Generates cryptographically secure random bytes.
 * 
 * @param length - The number of random bytes to generate.
 * @returns {Promise<Uint8Array>} - A promise resolving to a Uint8Array containing the random bytes.
 */
export function randomBytes(length: number): Promise<Uint8Array> {
  const _nodeRandom = async (len: number): Promise<Uint8Array> => {
    const { randomBytes: r } = await import('crypto');
    return r(len);
  };

  if(!isBrowser()) return _nodeRandom(length);
  return Promise.resolve(getRandomValues(new Uint8Array(length)));
}
