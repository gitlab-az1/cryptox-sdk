import math from 'typesdk/math';
import { Exception } from 'typesdk/errors';
import { isPlainObject } from 'typesdk/utils/is';

import Lazy from './lazy';


const hasNativeBufferSupport = typeof Buffer !== 'undefined';
const indexOfTable = new Lazy(() => new Uint8Array(256));

let textEncoder: TextEncoder | null = null;
let textDecoder: TextDecoder | null = null;


export type BufferEncoding =
  | 'ascii'
  | 'utf8'
  | 'utf-8'
  | 'utf16le'
  | 'utf-16le'
  | 'ucs2'
  | 'ucs-2'
  | 'base64'
  | 'base64url'
  | 'latin1'
  | 'binary'
  | 'hex';

const _validBufferEncodings = new Set<BufferEncoding>([
  'ascii',
  'utf8',
  'utf-8',
  'utf16le',
  'utf-16le',
  'ucs2',
  'ucs-2',
  'base64',
  'base64url',
  'latin1',
  'binary',
  'hex',
]);

/**
 * An array of valid buffer encodings.
 */
export const bufferEncodings = Object.freeze([..._validBufferEncodings]) as readonly BufferEncoding[];


export type BufferLike = XBuffer | Uint8Array | Buffer | ArrayBufferLike;


/**
 * Initialization options for `XBuffer` instances.
 */
export type BufferInitOptions = {
  encoding?: BufferEncoding;
  dontUseNodeBuffer?: boolean;
}


export interface PolymorphicBufferConstructor {

  /**
   * Allocates a new `PolymorphicBuffer` of `byteLength` bytes.
   * @param {number} byteLength 
   */
  alloc(byteLength: number): PolymorphicBuffer;

  /**
   * Wraps the given `Uint8Array` in a `PolymorphicBuffer` instance.
   * @param {Uint8Array} actual 
   */
  wrap(actual: Uint8Array): PolymorphicBuffer;

  /**
   * Creates a new `PolymorphicBuffer` instance from the given string.
   * 
   * @param {string} str The string to encode. 
   * @param {BufferInitOptions|undefined} options Optional initialization options. 
   */
  fromString(str: string, options?: BufferInitOptions): PolymorphicBuffer;

  /**
   * Creates a new `PolymorphicBuffer` instance from the given array of bytes.
   * 
   * @param {Array<number>} source The array of bytes to wrap. 
   */
  fromByteArray(source: number[]): PolymorphicBuffer;

  /**
   * Creates a new `PolymorphicBuffer` instance from the given binary tail string.
   * 
   * @param binaryTail 
   */
  fromBinaryTail(binaryTail: string): PolymorphicBuffer;

  /**
   * Creates a new `PolymorphicBuffer` instance from the given array of `PolymorphicBuffer` instances.
   * 
   * @param {Array<PolymorphicBuffer>} buffers The array of `PolymorphicBuffer` instances to wrap. 
   * @param {number|undefined} totalLength Optional total length of the buffers when concatenated. 
   */
  concat(buffers: PolymorphicBuffer[], totalLength?: number): PolymorphicBuffer;

  /**
   * Creates a new `PolymorphicBuffer` instance from the given `Buffer`.
   * 
   * @param {Buffer} buffer The `Buffer` to wrap. 
   * @param {BufferInitOptions|undefined} options Optional initialization options. 
   */
  fromNodeBuffer(buffer: Buffer, options?: Omit<BufferInitOptions, 'dontUseNodeBuffer'>): PolymorphicBuffer;

  /**
   * Creates a new `PolymorphicBuffer` instance from the given `Uint8Array`.
   * 
   * @param {Uint8Array} buffer The `Uint8Array` to wrap.
   * @param {BufferInitOptions|undefined} options Optional initialization options.
   */
  fromUint8Array(buffer: Uint8Array, options?: Omit<BufferInitOptions, 'dontUseNodeBuffer'>): PolymorphicBuffer;

  // new (buffer: Uint8Array, initialEncoding?: BufferEncoding): PolymorphicBuffer;
}

export interface PolymorphicBuffer {

  /**
   * The backing store `Uint8Array` of this `PolymorphicBuffer` instance.
   */
  readonly buffer: Uint8Array;

  /**
   * The number of bytes in this `PolymorphicBuffer`.
   */
  readonly byteLength: number;

  /**
   * The number of items in this `PolymorphicBuffer`.
   */
  readonly length: number;

  /**
   * Creates a new `PolymorphicBuffer` instance with a section of this `PolymorphicBuffer`.
   * 
   * @param {number|undefined} start 
   * @param {number|undefiend} end 
   */
  slice(start?: number, end?: number): PolymorphicBuffer;

  /**
   * Copies this `PolymorphicBuffer` instance into a new `PolymorphicBuffer` instance.
   */
  clone(): PolymorphicBuffer;

  /**
   * Sets the bytes in this `PolymorphicBuffer` instance to the bytes in the given `PolymorphicBuffer` instance.
   * 
   * @param array 
   * @param offset 
   */
  set(array: PolymorphicBuffer, offset?: number): void;

  /**
   * Sets the bytes in this `PolymorphicBuffer` instance to the bytes in the given `Uint8Array` instance.
   * 
   * @param array 
   * @param offset 
   */
  set(array: Uint8Array, offset?: number): void;

  /**
   * Sets the bytes in this `PolymorphicBuffer` instance to the bytes in the given `ArrayBuffer` instance.
   * 
   * @param array 
   * @param offset 
   */
  set(array: ArrayBuffer, offset?: number): void;

  /**
   * Sets the bytes in this `PolymorphicBuffer` instance to the bytes in the given `ArrayBufferView` instance.
   * 
   * @param array 
   * @param offset 
   */
  set(array: ArrayBufferView, offset?: number): void;

  /**
   * Sets the given value to all bytes in this `PolymorphicBuffer` instance.
   * 
   * @param value 
   * @param offset 
   * @param end 
   */
  fill(value: number, offset?: number, end?: number): void;

  /**
   * Reads an unsigned 32-bit integer from this `PolymorphicBuffer` instance at the given offset.
   * 
   * @param offset 
   */
  readUInt32BE(offset: number): number;

  /**
   * Writes an unsigned 32-bit integer to this `PolymorphicBuffer` instance at the given offset.
   * 
   * @param value 
   * @param offset 
   */
  writeUInt32BE(value: number, offset: number): void;

  /**
   * Reads an unsigned 32-bit integer from this `PolymorphicBuffer` instance at the given offset.
   * 
   * @param offset 
   */
  readUInt32LE(offset: number): number;

  /**
   * Writes an unsigned 32-bit integer to this `PolymorphicBuffer` instance at the given offset.
   * 
   * @param value 
   * @param offset 
   */
  writeUInt32LE(value: number, offset: number): void;

  /**
   * Reads an unsigned 8-bit integer from this `PolymorphicBuffer` instance at the given offset.
   * 
   * @param offset 
   */
  readUInt8(offset: number): number;

  /**
   * Writes an unsigned 8-bit integer to this `PolymorphicBuffer` instance at the given offset.
   * 
   * @param value
   * @param offset
   */
  writeUInt8(value: number, offset: number): void;

  /**
   * Returns the index of the first occurrence of the given `PolymorphicBuffer` instance in this `PolymorphicBuffer` instance.
   * 
   * @param subarray 
   * @param offset 
   */
  indexOf(subarray: PolymorphicBuffer | Uint8Array, offset?: number): number;

  /**
   * Returns a string representation of the `PolymorphicBuffer` instance.
   * @param {BufferEncoding} encoding 
   */
  toString(encoding?: BufferEncoding): string;
}


/**
 * A polyfill for the `Buffer` class that works in both nodejs and browser contexts.
 * It wraps a `Uint8Array` or a `Buffer` (when running in a nodejs context)
 */
export class XBuffer implements PolymorphicBuffer {

  /**
   * When running in a nodejs context, the backing store for the returned `XBuffer` instance
   * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
   */
  public static alloc(byteLength: number): XBuffer {
    if(hasNativeBufferSupport) return new XBuffer(Buffer.allocUnsafe(byteLength));

    const uint8Array = new Uint8Array(byteLength);
    uint8Array.fill(0x0);

    return new XBuffer(uint8Array);
  }

  /**
   * When running in a nodejs context, if `actual` is not a nodejs Buffer, the backing store for
   * the returned `XBuffer` instance might use a nodejs Buffer allocated from node's Buffer pool,
   * which is not transferrable.
   */
  public static wrap(actual: Uint8Array): XBuffer {
    if(hasNativeBufferSupport && !(Buffer.isBuffer(actual))) {
      
      // https://nodejs.org/dist/latest-v10.x/docs/api/buffer.html#buffer_class_method_buffer_from_arraybuffer_byteoffset_length
      // Create a zero-copy Buffer wrapper around the ArrayBuffer pointed to by the Uint8Array
      actual = Buffer.from(actual.buffer, actual.byteOffset, actual.byteLength);
    }
      
    return new XBuffer(actual);
  }

  /**
   * When running in a nodejs context and `dontUseNodeBuffer` is not `true`, the backing store for
   * the returned `XBuffer` instance might use a nodejs Buffer allocated from node's Buffer pool,
   * which is not transferrable.
   * 
   * Else, the backing store for the returned `XBuffer` instance is a Uint8Array.
   */
  public static fromString(str: string, options?: BufferInitOptions): XBuffer {
    if(!!options?.encoding && !_validBufferEncodings.has(options.encoding)) {
      throw new TypeError(`Invalid encoding: ${options.encoding}`);
    }

    const dontUseNodeBuffer = (typeof options?.dontUseNodeBuffer === 'boolean' ?
      options.dontUseNodeBuffer : false);

    if(!dontUseNodeBuffer && hasNativeBufferSupport) return new XBuffer(
      Buffer.from(str, options?.encoding),
      options?.encoding // eslint-disable-line comma-dangle
    );

    const te = this.#getTextEncoder();
    return new XBuffer(te.encode(str), options?.encoding);
  }

  /**
   * When running in a nodejs context, the backing store for the returned `XBuffer` instance
   * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
   */
  public static fromByteArray(source: number[]): XBuffer {
    const result = XBuffer.alloc(source.length);

    for(let i = 0, len = source.length; i < len; i++) {
      result.buffer[i] = source[i];
    }

    return result;
  }

  /**
   * Creates a new `PolymorphicBuffer` instance from the given binary tail string.
   */
  public static fromBinaryTail(binaryTail: string): XBuffer {
    if(binaryTail.length % 8 !== 0) {
      throw new TypeError('Invalid binary tail');
    }

    const result = XBuffer.alloc(binaryTail.length / 8);

    for(let i = 0, len = binaryTail.length; i < len; i += 8) {
      // result.buffer[i / 8] = parseInt(binaryTail.substr(i, 8), 2);
      result.buffer[i / 8] = parseInt(
        binaryTail.substring(i, i + 8),
        2 // eslint-disable-line comma-dangle
      );
    }

    return result;
  }

  /**
   * When running in a nodejs context, the backing store for the returned `XBuffer` instance
   * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
   */
  public static concat(buffers: XBuffer[], totalLength?: number): XBuffer {
    if(typeof totalLength === 'undefined') {
      totalLength = 0;

      for(let i = 0, len = buffers.length; i < len; i++) {
        totalLength += buffers[i].byteLength;
      }
    }

    const ret = XBuffer.alloc(totalLength);
    let offset = 0;

    for(let i = 0, len = buffers.length; i < len; i++) {
      const element = buffers[i];
      ret.set(element, offset);

      offset += element.byteLength;
    }

    return ret;
  }

  public static fromNodeBuffer(buffer: Buffer, options?: Omit<BufferInitOptions, 'dontUseNodeBuffer'>): XBuffer {
    if(!hasNativeBufferSupport) {
      throw new Exception('Cannot create a XBuffer from a nodejs Buffer when running in a browser context');
    }

    if(!!options?.encoding && !_validBufferEncodings.has(options.encoding)) {
      throw new TypeError(`Invalid encoding: ${options.encoding}`);
    }

    if(!Buffer.isBuffer(buffer)) {
      const _type = (typeof buffer !== 'object' || isPlainObject(buffer)) ?
        typeof buffer :
        (buffer as any).constructor.name;

      throw new TypeError(`Expected argument $0 to be instance of \`Buffer\` but received \`${_type}\``);
    }

    return new XBuffer(buffer, options?.encoding);
  }

  public static fromUint8Array(buffer: Uint8Array, options?: Omit<BufferInitOptions, 'dontUseNodeBuffer'>): XBuffer {
    if(!(buffer instanceof Uint8Array)) {
      const _type = (typeof buffer !== 'object' || isPlainObject(buffer)) ?
        typeof buffer :
        (buffer as any).constructor.name;
    
      throw new TypeError(`Expected argument $0 to be instance of \`Uint8Array\` but received \`${_type}\``);
    }

    if(!!options?.encoding && !_validBufferEncodings.has(options.encoding)) {
      throw new TypeError(`Invalid encoding: ${options.encoding}`);
    }

    return new XBuffer(buffer, options?.encoding);
  }

  static #getTextEncoder(): TextEncoder {
    if(!textEncoder) {
      textEncoder = new TextEncoder();
    }

    return textEncoder;
  }

  static #getTextDecoder(): TextDecoder {
    if(!textDecoder) {
      textDecoder = new TextDecoder('utf-8');
    }

    return textDecoder;
  }

  public readonly buffer: Uint8Array;

  // @ts-expect-error `initialEncoding` is a private field and never used
  readonly #initialEncoding: BufferEncoding;
  readonly #byteLength: number;
  readonly #length: number;

  private constructor(buffer: Uint8Array, initialEncoding?: BufferEncoding) {
    this.buffer = buffer;
    this.#length = buffer.length;
    this.#byteLength = buffer.byteLength;
    this.#initialEncoding = initialEncoding ?? 'utf-8';
  }

  public get byteLength(): number {
    return this.#byteLength;
  }

  public get length(): number {
    return this.#length;
  }

  public fill(value: number, offset?: number, end?: number): void {
    this.buffer.fill(value, offset, end);
  }

  public slice(start?: number, end?: number): XBuffer {
    return new XBuffer(this.buffer.subarray(start, end));
  }

  /**
   * When running in a nodejs context, the backing store for the returned `XBuffer` instance
   * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
   */
  public clone(): XBuffer {
    const result = XBuffer.alloc(this.byteLength);
    result.set(this);

    return result;
  }

  public set(array: XBuffer, offset?: number): void;
  public set(array: Uint8Array, offset?: number): void;
  public set(array: ArrayBuffer, offset?: number): void;
  public set(array: ArrayBufferView, offset?: number): void;
  public set(array: XBuffer | Uint8Array | ArrayBuffer | ArrayBufferView, offset?: number): void;
  public set(array: XBuffer | Uint8Array | ArrayBuffer | ArrayBufferView, offset?: number): void {
    if (array instanceof XBuffer) {
      this.buffer.set(array.buffer, offset);
    } else if (array instanceof Uint8Array) {
      this.buffer.set(array, offset);
    } else if (array instanceof ArrayBuffer) {
      this.buffer.set(new Uint8Array(array), offset);
    } else if (ArrayBuffer.isView(array)) {
      this.buffer.set(new Uint8Array(array.buffer, array.byteOffset, array.byteLength), offset);
    } else {
      throw new Exception('Unknown argument \'array\'');
    }
  }

  public readUInt32BE(offset: number): number {
    return readUInt32BE(this.buffer, offset);
  }

  public writeUInt32BE(value: number, offset: number): void {
    writeUInt32BE(this.buffer, value, offset);
  }

  public readUInt32LE(offset: number): number {
    return readUInt32LE(this.buffer, offset);
  }

  public writeUInt32LE(value: number, offset: number): void {
    writeUInt32LE(this.buffer, value, offset);
  }

  public readUInt8(offset: number): number {
    return readUInt8(this.buffer, offset);
  }

  public writeUInt8(value: number, offset: number): void {
    writeUInt8(this.buffer, value, offset);
  }

  public indexOf(subarray: XBuffer | Uint8Array, offset = 0) {
    return binaryIndexOf(this.buffer, subarray instanceof XBuffer ? subarray.buffer : subarray, offset);
  }

  public toString(encoding?: BufferEncoding | 'binary-tail'): string {
    if(!!encoding && encoding !== 'binary-tail' && !_validBufferEncodings.has(encoding)) {
      throw new TypeError(`Invalid encoding: ${encoding}`);
    }

    if(encoding === 'binary-tail') return _encodeNonUTF8Buffer(this.buffer, 'binary-tail');
    if(hasNativeBufferSupport && Buffer.isBuffer(this.buffer)) return this.buffer.toString(encoding);

    const utf8 = XBuffer.#getTextDecoder().decode(this.buffer);

    if(!encoding || 
      encoding === 'utf-8' ||
      encoding === 'utf8') return utf8;

    return _encodeNonUTF8Buffer(this.buffer, encoding);
  }
}


function _encodeNonUTF8Buffer(buffer: Uint8Array, encoding: BufferEncoding | 'binary-tail'): string {
  switch(encoding) {
    case 'hex':
      return Array.prototype.map.call(buffer, function(byte: number) {
        return ('0' + byte.toString(16)).slice(-2);
      }).join('');
    case 'base64':
      return encodeBase64(buffer);
    case 'base64url':
      return encodeBase64(buffer, false, true);
    case 'binary':
      return Array.prototype.map.call(buffer, function(byte: number) {
        return String.fromCharCode(byte);
      }).join('');
    case 'binary-tail': {
      let result = '';
        
      Array.prototype.map.call(buffer, function(byte: number) {
        const binaryChar = byte.toString(2);
        result += '0'.repeat(8 - binaryChar.length) + binaryChar;
      }).join('').trim();
  
      return result;
    }
    default:
      throw new Exception(`Unsupported encoding: ${encoding}`);
  }
}


/**
 * Like String.indexOf, but works on Uint8Arrays.
 * Uses the boyer-moore-horspool algorithm to be reasonably speedy.
 */
export function binaryIndexOf(haystack: Uint8Array, needle: Uint8Array, offset = 0): number {
  const needleLen = needle.byteLength;
  const haystackLen = haystack.byteLength;

  if(needleLen === 0) return 0;
  if(needleLen === 1) return haystack.indexOf(needle[0]);
  if(needleLen > haystackLen - offset) return -1;

  // find index of the subarray using boyer-moore-horspool algorithm
  const table = indexOfTable.value;
  table.fill(needle.length);

  for (let i = 0; i < needle.length; i++) {
    table[needle[i]] = needle.length - i - 1;
  }

  let i = offset + needle.length - 1;
  let j = i;
  let result = -1;
  
  while (i < haystackLen) {
    if (haystack[i] === needle[j]) {
      if (j === 0) {
        result = i;
        break;
      }

      i--;
      j--;
    } else {
      i += math.max(needle.length - j, table[haystack[i]]);
      j = needle.length - 1;
    }
  }

  return result;
}

export function readUInt16LE(source: Uint8Array, offset: number): number {
  return (
    ((source[offset + 0] << 0) >>> 0) |
      ((source[offset + 1] << 8) >>> 0)
  );
}

export function writeUInt16LE(destination: Uint8Array, value: number, offset: number): void {
  destination[offset + 0] = (value & 0b11111111);
  value = value >>> 8;
  destination[offset + 1] = (value & 0b11111111);
}

export function readUInt32BE(source: Uint8Array, offset: number): number {
  return (
    source[offset] * 2 ** 24
      + source[offset + 1] * 2 ** 16
      + source[offset + 2] * 2 ** 8
      + source[offset + 3]
  );
}

export function writeUInt32BE(destination: Uint8Array, value: number, offset: number): void {
  destination[offset + 3] = value;
  value = value >>> 8;
  destination[offset + 2] = value;
  value = value >>> 8;
  destination[offset + 1] = value;
  value = value >>> 8;
  destination[offset] = value;
}

export function readUInt32LE(source: Uint8Array, offset: number): number {
  return (
    ((source[offset + 0] << 0) >>> 0) |
      ((source[offset + 1] << 8) >>> 0) |
      ((source[offset + 2] << 16) >>> 0) |
      ((source[offset + 3] << 24) >>> 0)
  );
}

export function writeUInt32LE(destination: Uint8Array, value: number, offset: number): void {
  destination[offset + 0] = (value & 0b11111111);
  value = value >>> 8;
  destination[offset + 1] = (value & 0b11111111);
  value = value >>> 8;
  destination[offset + 2] = (value & 0b11111111);
  value = value >>> 8;
  destination[offset + 3] = (value & 0b11111111);
}

export function readUInt8(source: Uint8Array, offset: number): number {
  return source[offset];
}

export function writeUInt8(destination: Uint8Array, value: number, offset: number): void {
  destination[offset] = value;
}

/** Decodes base64 to a uint8 array. URL-encoded and unpadded base64 is allowed. */
export function decodeBase64(encoded: string) {
  let building = 0;
  let remainder = 0;
  let bufi = 0;

  // The simpler way to do this is `Uint8Array.from(atob(str), c => c.charCodeAt(0))`,
  // but that's about 10-20x slower than this function in current Chromium versions.

  const buffer = new Uint8Array(Math.floor(encoded.length / 4 * 3));
  const append = (value: number) => {
    switch (remainder) {
      case 3:
        buffer[bufi++] = building | value;
        remainder = 0;
        break;
      case 2:
        buffer[bufi++] = building | (value >>> 2);
        building = value << 6;
        remainder = 3;
        break;
      case 1:
        buffer[bufi++] = building | (value >>> 4);
        building = value << 4;
        remainder = 2;
        break;
      default:
        building = value << 2;
        remainder = 1;
    }
  };

  for (let i = 0; i < encoded.length; i++) {
    const code = encoded.charCodeAt(i);
    // See https://datatracker.ietf.org/doc/html/rfc4648#section-4
    // This branchy code is about 3x faster than an indexOf on a base64 char string.
    if (code >= 65 && code <= 90) {
      append(code - 65); // A-Z starts ranges from char code 65 to 90
    } else if (code >= 97 && code <= 122) {
      append(code - 97 + 26); // a-z starts ranges from char code 97 to 122, starting at byte 26
    } else if (code >= 48 && code <= 57) {
      append(code - 48 + 52); // 0-9 starts ranges from char code 48 to 58, starting at byte 52
    } else if (code === 43 || code === 45) {
      append(62); // "+" or "-" for URLS
    } else if (code === 47 || code === 95) {
      append(63); // "/" or "_" for URLS
    } else if (code === 61) {
      break; // "="
    } else {
      throw new SyntaxError(`Unexpected base64 character ${encoded[i]}`);
    }
  }

  const unpadded = bufi;

  while(remainder > 0) {
    append(0);
  }

  // slice is needed to account for overestimation due to padding
  return XBuffer.wrap(buffer).slice(0, unpadded);
}

const base64Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const base64UrlSafeAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** Encodes a buffer to a base64 string. */
export function encodeBase64(buffer: Uint8Array, padded = true, urlSafe = false) {
  const dictionary = urlSafe ? base64UrlSafeAlphabet : base64Alphabet;
  let output = '';

  const remainder = buffer.byteLength % 3;
  let i = 0;
  
  for(; i < buffer.byteLength - remainder; i += 3) {
    const a = buffer[i + 0];
    const b = buffer[i + 1];
    const c = buffer[i + 2];

    output += dictionary[a >>> 2];
    output += dictionary[(a << 4 | b >>> 4) & 0b111111];
    output += dictionary[(b << 2 | c >>> 6) & 0b111111];
    output += dictionary[c & 0b111111];
  }

  if(remainder === 1) {
    const a = buffer[i + 0];

    output += dictionary[a >>> 2];
    output += dictionary[(a << 4) & 0b111111];

    if(padded) {
      output += '==';
    }
  } else if (remainder === 2) {
    const a = buffer[i + 0];
    const b = buffer[i + 1];

    output += dictionary[a >>> 2];
    output += dictionary[(a << 4 | b >>> 4) & 0b111111];
    output += dictionary[(b << 2) & 0b111111];

    if(padded) {
      output += '=';
    }
  }

  return output;
}


export default XBuffer;
