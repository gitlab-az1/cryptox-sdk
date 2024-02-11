import XBuffer from './_internal/resources/buffer';

import {
  isBrowser,
  toNodeValue,
  toUint8Buffer,
  wasmSupported,
  toWebCryptoAlgorithm,
} from './_internal/utils';



function _browser_pbkdf2(
  subtle: SubtleCrypto,
  password: string | Uint8Array,
  salt: string | Uint8Array,
  algorithm: 'sha256' | 'sha512',
  iterations: number // eslint-disable-line comma-dangle
): Promise<Uint8Array>;

function _browser_pbkdf2(
  subtle: SubtleCrypto,
  password: string | Uint8Array,
  salt: string | Uint8Array,
  algorithm: 'sha256' | 'sha512',
  iterations: number,
  output: 'buffer' // eslint-disable-line comma-dangle
): Promise<XBuffer>;

function _browser_pbkdf2(
  subtle: SubtleCrypto,
  password: string | Uint8Array,
  salt: string | Uint8Array,
  algorithm: 'sha256' | 'sha512',
  iterations: number,
  output: 'bytearray' // eslint-disable-line comma-dangle
): Promise<Uint8Array>;

function _browser_pbkdf2(
  subtle: SubtleCrypto,
  password: string | Uint8Array,
  salt: string | Uint8Array,
  algorithm: 'sha256' | 'sha512',
  iterations: number,
  output: 'hex' // eslint-disable-line comma-dangle
): Promise<string>;

async function _browser_pbkdf2(
  subtle: SubtleCrypto,
  password: string | Uint8Array,
  salt: string | Uint8Array,
  algorithm: 'sha256' | 'sha512',
  iterations: number,
  output?: 'bytearray' | 'buffer' | 'hex' // eslint-disable-line comma-dangle
): Promise<XBuffer | Uint8Array | string> {
  const wcLength = algorithm === 'sha256' ? 256 : 512;
  const p = typeof password === 'string' ? XBuffer.fromString(password) : XBuffer.fromUint8Array(password);
  const s = typeof salt === 'string' ? XBuffer.fromString(salt) : XBuffer.fromUint8Array(salt);

  const params: Pbkdf2Params = {
    name: 'PBKDF2',
    salt: s.buffer,
    iterations,
    hash: {
      name: toWebCryptoAlgorithm(algorithm),
    },
  };

  const key = await subtle.importKey(
    'raw',
    p.buffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits'] // eslint-disable-line comma-dangle
  );

  const buffer = await subtle.deriveBits(params, key, wcLength);
  const uint8Array = new Uint8Array(buffer);

  if(!output || output === 'bytearray') return uint8Array;
  if(output === 'buffer') return XBuffer.fromUint8Array(uint8Array);
  if(output === 'hex') return XBuffer.fromUint8Array(uint8Array).toString('hex');

  throw new TypeError(`Invalid output type: ${output}`);
}


function _node_pbkdf2(
  password: string | Uint8Array,
  salt: string | Uint8Array,
  algorithm: 'sha256' | 'sha512',
  iterations: number // eslint-disable-line comma-dangle
): Promise<Uint8Array>;

function _node_pbkdf2(
  password: string | Uint8Array,
  salt: string | Uint8Array,
  algorithm: 'sha256' | 'sha512',
  iterations: number,
  output: 'buffer' // eslint-disable-line comma-dangle
): Promise<XBuffer>;

function _node_pbkdf2(
  password: string | Uint8Array,
  salt: string | Uint8Array,
  algorithm: 'sha256' | 'sha512',
  iterations: number,
  output: 'bytearray' // eslint-disable-line comma-dangle
): Promise<Uint8Array>;

function _node_pbkdf2(
  password: string | Uint8Array,
  salt: string | Uint8Array,
  algorithm: 'sha256' | 'sha512',
  iterations: number,
  output: 'hex' // eslint-disable-line comma-dangle
): Promise<string>;

async function _node_pbkdf2(
  password: string | Uint8Array,
  salt: string | Uint8Array,
  algorithm: 'sha256' | 'sha512',
  iterations: number,
  output?: 'bytearray' | 'buffer' | 'hex' // eslint-disable-line comma-dangle
): Promise<string | XBuffer | Uint8Array> {
  const { pbkdf2 } = await import('crypto');

  const len = algorithm === 'sha256' ? 32 : 64;
  const p = toNodeValue(password);
  const s = toNodeValue(salt);

  return new Promise<string | Uint8Array | XBuffer>((resolve, reject) => {
    pbkdf2(p, s, iterations, len, algorithm, (err, buffer) => {
      if(!!err && err != null) return reject(err);

      if(!output) return resolve(XBuffer.fromNodeBuffer(buffer).buffer);

      switch(output) {
        case 'buffer':
          return resolve(XBuffer.fromNodeBuffer(buffer));
        case 'bytearray':
          return resolve(XBuffer.fromNodeBuffer(buffer).buffer);
        case 'hex':
          return resolve(XBuffer.fromNodeBuffer(buffer).toString('hex'));
        default: 
          return reject(new TypeError(`Invalid output type: ${output}`));
      }
    });
  });
}


/**
 * Derives a key using the PBKDF2 algorithm.
 * 
 * @param password - The password to derive the key from.
 * @param salt - The salt used in the key derivation.
 * @param algorithm - The hash algorithm to use ('sha256' or 'sha512').
 * @param iterations - The number of iterations for the key derivation.
 * @param output - (Optional) The output type ('buffer', 'bytearray', or 'hex').
 * @returns A promise resolving to the derived key.
 */
export function pbkdf2(
  password: string | Uint8Array,
  salt: string | Uint8Array,
  algorithm: 'sha256' | 'sha512',
  iterations: number // eslint-disable-line comma-dangle
): Promise<Uint8Array>;

/**
 * Derives a key using the PBKDF2 algorithm.
 * 
 * @param password - The password to derive the key from.
 * @param salt - The salt used in the key derivation.
 * @param algorithm - The hash algorithm to use ('sha256' or 'sha512').
 * @param iterations - The number of iterations for the key derivation.
 * @param output - (Optional) The output type ('buffer', 'bytearray', or 'hex').
 * @returns A promise resolving to the derived key.
 */
export function pbkdf2(
  password: string | Uint8Array,
  salt: string | Uint8Array,
  algorithm: 'sha256' | 'sha512',
  iterations: number,
  output: 'buffer' // eslint-disable-line comma-dangle
): Promise<XBuffer>;

/**
 * Derives a key using the PBKDF2 algorithm.
 * 
 * @param password - The password to derive the key from.
 * @param salt - The salt used in the key derivation.
 * @param algorithm - The hash algorithm to use ('sha256' or 'sha512').
 * @param iterations - The number of iterations for the key derivation.
 * @param output - (Optional) The output type ('buffer', 'bytearray', or 'hex').
 * @returns A promise resolving to the derived key.
 */
export function pbkdf2(
  password: string | Uint8Array,
  salt: string | Uint8Array,
  algorithm: 'sha256' | 'sha512',
  iterations: number,
  output: 'bytearray' // eslint-disable-line comma-dangle
): Promise<Uint8Array>;

/**
 * Derives a key using the PBKDF2 algorithm.
 * 
 * @param password - The password to derive the key from.
 * @param salt - The salt used in the key derivation.
 * @param algorithm - The hash algorithm to use ('sha256' or 'sha512').
 * @param iterations - The number of iterations for the key derivation.
 * @param output - (Optional) The output type ('buffer', 'bytearray', or 'hex').
 * @returns A promise resolving to the derived key.
 */
export function pbkdf2(
  password: string | Uint8Array,
  salt: string | Uint8Array,
  algorithm: 'sha256' | 'sha512',
  iterations: number,
  output: 'hex' // eslint-disable-line comma-dangle
): Promise<string>;


/**
 * Derives a key using the PBKDF2 algorithm.
 * 
 * @param password - The password to derive the key from.
 * @param salt - The salt used in the key derivation.
 * @param algorithm - The hash algorithm to use ('sha256' or 'sha512').
 * @param iterations - The number of iterations for the key derivation.
 * @param output - (Optional) The output type ('buffer', 'bytearray', or 'hex').
 * @returns A promise resolving to the derived key.
 */
export function pbkdf2(
  password: string | Uint8Array,
  salt: string | Uint8Array,
  algorithm: 'sha256' | 'sha512',
  iterations: number,
  output?: 'bytearray' | 'buffer' | 'hex' // eslint-disable-line comma-dangle
): Promise<string | XBuffer | Uint8Array> {
  if(!isBrowser()) return _node_pbkdf2(
    password,
    salt,
    algorithm,
    iterations,

    // @ts-expect-error The parameter is not required in one of the overloads
    output // eslint-disable-line comma-dangle
  );

  const crypto = typeof window.crypto !== 'undefined' ? window.crypto : null;
  const subtle = !!crypto && typeof window.crypto.subtle !== 'undefined' ? window.crypto.subtle : null;

  if(!subtle) {
    throw new Error('WebCrypto is not supported in this environment.');
  }

  return _browser_pbkdf2(
    subtle,
    password,
    salt,
    algorithm,
    iterations,

    // @ts-expect-error The parameter is not required in one of the overloads
    output // eslint-disable-line comma-dangle
  );
}


function _node_argon2(
  password: string | Uint8Array,
  salt: string | Uint8Array,
  iterations: number,
  memory: number,
  parallelism: number // eslint-disable-line comma-dangle
): Promise<Uint8Array>;

function _node_argon2(
  password: string | Uint8Array,
  salt: string | Uint8Array,
  iterations: number,
  memory: number,
  parallelism: number,
  output: 'buffer' // eslint-disable-line comma-dangle
): Promise<XBuffer>;

function _node_argon2(
  password: string | Uint8Array,
  salt: string | Uint8Array,
  iterations: number,
  memory: number,
  parallelism: number,
  output: 'bytearray' // eslint-disable-line comma-dangle
): Promise<Uint8Array>;

function _node_argon2(
  password: string | Uint8Array,
  salt: string | Uint8Array,
  iterations: number,
  memory: number,
  parallelism: number,
  output: 'hex' // eslint-disable-line comma-dangle
): Promise<string>;

async function _node_argon2(
  password: string | Uint8Array,
  salt: string | Uint8Array,
  iterations: number,
  memory: number,
  parallelism: number,
  output?: 'bytearray' | 'buffer' | 'hex' // eslint-disable-line comma-dangle
): Promise<string | XBuffer | Uint8Array> {
  const { hash, argon2id } = await import('argon2');

  const p = toNodeValue(password);
  const s = Buffer.from(toUint8Buffer(salt));

  const o = await hash(p, {
    salt: s,
    raw: true,
    hashLength: 32,
    timeCost: iterations,
    memoryCost: memory,
    parallelism,
    type: argon2id,
  });

  const uint8Array = toUint8Buffer(o);

  if(!output) return uint8Array;
  if(output === 'buffer') return XBuffer.fromUint8Array(uint8Array);
  if(output === 'bytearray') return uint8Array;
  if(output === 'hex') return XBuffer.fromUint8Array(uint8Array).toString('hex');

  throw new TypeError(`Invalid output type: ${output}`);
}


function _browser_argon2(
  password: string | Uint8Array,
  salt: string | Uint8Array,
  iterations: number,
  memory: number,
  parallelism: number // eslint-disable-line comma-dangle
): Promise<Uint8Array>;

function _browser_argon2(
  password: string | Uint8Array,
  salt: string | Uint8Array,
  iterations: number,
  memory: number,
  parallelism: number,
  output: 'buffer' // eslint-disable-line comma-dangle
): Promise<XBuffer>;

function _browser_argon2(
  password: string | Uint8Array,
  salt: string | Uint8Array,
  iterations: number,
  memory: number,
  parallelism: number,
  output: 'bytearray' // eslint-disable-line comma-dangle
): Promise<Uint8Array>;

function _browser_argon2(
  password: string | Uint8Array,
  salt: string | Uint8Array,
  iterations: number,
  memory: number,
  parallelism: number,
  output: 'hex' // eslint-disable-line comma-dangle
): Promise<string>;

async function _browser_argon2(
  password: string | Uint8Array,
  salt: string | Uint8Array,
  iterations: number,
  memory: number,
  parallelism: number,
  output?: 'bytearray' | 'buffer' | 'hex' // eslint-disable-line comma-dangle
): Promise<string | XBuffer | Uint8Array> {
  if(!wasmSupported()) {
    throw new Error('WebAssembly is not supported in this environment.');
  }

  const { hash, unloadRuntime, ArgonType } = await import('argon2-browser');

  const passwordByteArray = new Uint8Array(toUint8Buffer(password));
  const saltByteArray = new Uint8Array(toUint8Buffer(salt));

  const result = await hash({
    pass: passwordByteArray,
    salt: saltByteArray,
    time: iterations,
    mem: memory,
    parallelism,
    hashLen: 32,
    type: ArgonType.Argon2id,
  });

  unloadRuntime();
  const uint8Array = result.hash;

  if(!output) return uint8Array;
  if(output === 'buffer') return XBuffer.fromUint8Array(uint8Array);
  if(output === 'bytearray') return uint8Array;
  if(output === 'hex') return XBuffer.fromUint8Array(uint8Array).toString('hex');

  throw new TypeError(`Invalid output type: ${output}`);
}


/**
 * Derives a key using the Argon2 algorithm.
 * 
 * @param password - The password to derive the key from.
 * @param salt - The salt used in the key derivation.
 * @param iterations - The number of iterations for the key derivation.
 * @param memory - The memory parameter for Argon2.
 * @param parallelism - The parallelism parameter for Argon2.
 * @param output - (Optional) The output type ('buffer', 'bytearray', or 'hex').
 * @returns A promise resolving to the derived key.
 */
export function argon2(
  password: string | Uint8Array,
  salt: string | Uint8Array,
  iterations: number,
  memory: number,
  parallelism: number // eslint-disable-line comma-dangle
): Promise<Uint8Array>;

/**
 * Derives a key using the Argon2 algorithm.
 * 
 * @param password - The password to derive the key from.
 * @param salt - The salt used in the key derivation.
 * @param iterations - The number of iterations for the key derivation.
 * @param memory - The memory parameter for Argon2.
 * @param parallelism - The parallelism parameter for Argon2.
 * @param output - (Optional) The output type ('buffer', 'bytearray', or 'hex').
 * @returns A promise resolving to the derived key.
 */
export function argon2(
  password: string | Uint8Array,
  salt: string | Uint8Array,
  iterations: number,
  memory: number,
  parallelism: number,
  output: 'buffer' // eslint-disable-line comma-dangle
): Promise<XBuffer>;

/**
 * Derives a key using the Argon2 algorithm.
 * 
 * @param password - The password to derive the key from.
 * @param salt - The salt used in the key derivation.
 * @param iterations - The number of iterations for the key derivation.
 * @param memory - The memory parameter for Argon2.
 * @param parallelism - The parallelism parameter for Argon2.
 * @param output - (Optional) The output type ('buffer', 'bytearray', or 'hex').
 * @returns A promise resolving to the derived key.
 */
export function argon2(
  password: string | Uint8Array,
  salt: string | Uint8Array,
  iterations: number,
  memory: number,
  parallelism: number,
  output: 'bytearray' // eslint-disable-line comma-dangle
): Promise<Uint8Array>;

/**
 * Derives a key using the Argon2 algorithm.
 * 
 * @param password - The password to derive the key from.
 * @param salt - The salt used in the key derivation.
 * @param iterations - The number of iterations for the key derivation.
 * @param memory - The memory parameter for Argon2.
 * @param parallelism - The parallelism parameter for Argon2.
 * @param output - (Optional) The output type ('buffer', 'bytearray', or 'hex').
 * @returns A promise resolving to the derived key.
 */
export function argon2(
  password: string | Uint8Array,
  salt: string | Uint8Array,
  iterations: number,
  memory: number,
  parallelism: number,
  output: 'hex' // eslint-disable-line comma-dangle
): Promise<string>;

/**
 * Derives a key using the Argon2 algorithm.
 * 
 * @param password - The password to derive the key from.
 * @param salt - The salt used in the key derivation.
 * @param iterations - The number of iterations for the key derivation.
 * @param memory - The memory parameter for Argon2.
 * @param parallelism - The parallelism parameter for Argon2.
 * @param output - (Optional) The output type ('buffer', 'bytearray', or 'hex').
 * @returns A promise resolving to the derived key.
 */
export async function argon2(
  password: string | Uint8Array,
  salt: string | Uint8Array,
  iterations: number,
  memory: number,
  parallelism: number,
  output?: 'bytearray' | 'buffer' | 'hex' // eslint-disable-line comma-dangle
): Promise<string | XBuffer | Uint8Array> {
  if(!isBrowser()) return _node_argon2(
    password,
    salt,
    iterations,
    memory,
    parallelism,
    
    // @ts-expect-error The parameter is not required in one of the overloads
    output // eslint-disable-line comma-dangle
  );
    
  return _browser_argon2(
    password,
    salt,
    iterations,
    memory,
    parallelism,
    
    // @ts-expect-error The parameter is not required in one of the overloads
    output // eslint-disable-line comma-dangle
  );
}


/**
 * Derives a key using the PBKDF2 algorithm with HMAC-SHA256.
 * 
 * @param password - The password to derive the key from.
 * @param salt - The salt used in the key derivation.
 * @returns A promise resolving to the derived key.
 */
export function fastPBKDF2HmacSHA256(
  password: string | Uint8Array,
  salt: string | Uint8Array // eslint-disable-line comma-dangle
): Promise<XBuffer> {
  return pbkdf2(
    password,
    salt,
    'sha256',
    100000,
    'buffer',
  );
}

/**
 * Derives a key using the PBKDF2 algorithm with HMAC-SHA512.
 * 
 * @param password - The password to derive the key from.
 * @param salt - The salt used in the key derivation.
 * @returns A promise resolving to the derived key.
 */
export function fastPBKDF2HmacSHA512(
  password: string | Uint8Array,
  salt: string | Uint8Array // eslint-disable-line comma-dangle
): Promise<XBuffer> {
  return pbkdf2(
    password,
    salt,
    'sha512',
    100000,
    'buffer',
  );
}

/**
 * Derives a key using the Argon2 algorithm with preset parameters.
 * 
 * @param password - The password to derive the key from.
 * @param salt - The salt used in the key derivation.
 * @returns A promise resolving to the derived key.
 */
export function fastArgon2(
  password: string | Uint8Array,
  salt: string | Uint8Array // eslint-disable-line comma-dangle
): Promise<XBuffer> {
  return argon2(
    password,
    salt,
    3,
    4096,
    1,
    'buffer',
  );
}



/**
 * Namespace for PBKDF2 and Argon2 key derivation functions.
 */
export namespace keyd { // eslint-disable-line @typescript-eslint/no-namespace

  /**
   * Derives a key using the PBKDF2 algorithm.
   * 
   * @param password - The password to derive the key from.
   * @param salt - The salt used in the key derivation.
   * @param algorithm - The hash algorithm to use ('sha256' or 'sha512').
   * @param iterations - The number of iterations for the key derivation.
   * @param output - (Optional) The output type ('buffer', 'bytearray', or 'hex').
   * @returns A promise resolving to the derived key.
   */
  export function pbkdf2(
    password: string | Uint8Array,
    salt: string | Uint8Array,
    algorithm: 'sha256' | 'sha512',
    iterations: number // eslint-disable-line comma-dangle
  ): Promise<Uint8Array>;
  
  /**
   * Derives a key using the PBKDF2 algorithm.
   * 
   * @param password - The password to derive the key from.
   * @param salt - The salt used in the key derivation.
   * @param algorithm - The hash algorithm to use ('sha256' or 'sha512').
   * @param iterations - The number of iterations for the key derivation.
   * @param output - (Optional) The output type ('buffer', 'bytearray', or 'hex').
   * @returns A promise resolving to the derived key.
   */
  export function pbkdf2(
    password: string | Uint8Array,
    salt: string | Uint8Array,
    algorithm: 'sha256' | 'sha512',
    iterations: number,
    output: 'buffer' // eslint-disable-line comma-dangle
  ): Promise<XBuffer>;
  
  /**
   * Derives a key using the PBKDF2 algorithm.
   * 
   * @param password - The password to derive the key from.
   * @param salt - The salt used in the key derivation.
   * @param algorithm - The hash algorithm to use ('sha256' or 'sha512').
   * @param iterations - The number of iterations for the key derivation.
   * @param output - (Optional) The output type ('buffer', 'bytearray', or 'hex').
   * @returns A promise resolving to the derived key.
   */
  export function pbkdf2(
    password: string | Uint8Array,
    salt: string | Uint8Array,
    algorithm: 'sha256' | 'sha512',
    iterations: number,
    output: 'bytearray' // eslint-disable-line comma-dangle
  ): Promise<Uint8Array>;
  
  /**
   * Derives a key using the PBKDF2 algorithm.
   * 
   * @param password - The password to derive the key from.
   * @param salt - The salt used in the key derivation.
   * @param algorithm - The hash algorithm to use ('sha256' or 'sha512').
   * @param iterations - The number of iterations for the key derivation.
   * @param output - (Optional) The output type ('buffer', 'bytearray', or 'hex').
   * @returns A promise resolving to the derived key.
   */
  export function pbkdf2(
    password: string | Uint8Array,
    salt: string | Uint8Array,
    algorithm: 'sha256' | 'sha512',
    iterations: number,
    output: 'hex' // eslint-disable-line comma-dangle
  ): Promise<string>;
  
  
  /**
   * Derives a key using the PBKDF2 algorithm.
   * 
   * @param password - The password to derive the key from.
   * @param salt - The salt used in the key derivation.
   * @param algorithm - The hash algorithm to use ('sha256' or 'sha512').
   * @param iterations - The number of iterations for the key derivation.
   * @param output - (Optional) The output type ('buffer', 'bytearray', or 'hex').
   * @returns A promise resolving to the derived key.
   */
  export function pbkdf2(
    password: string | Uint8Array,
    salt: string | Uint8Array,
    algorithm: 'sha256' | 'sha512',
    iterations: number,
    output?: 'bytearray' | 'buffer' | 'hex' // eslint-disable-line comma-dangle
  ): Promise<string | XBuffer | Uint8Array> {
    if(!isBrowser()) return _node_pbkdf2(
      password,
      salt,
      algorithm,
      iterations,
  
      // @ts-expect-error The parameter is not required in one of the overloads
      output // eslint-disable-line comma-dangle
    );
  
    const crypto = typeof window.crypto !== 'undefined' ? window.crypto : null;
    const subtle = !!crypto && typeof window.crypto.subtle !== 'undefined' ? window.crypto.subtle : null;
  
    if(!subtle) {
      throw new Error('WebCrypto is not supported in this environment.');
    }
  
    return _browser_pbkdf2(
      subtle,
      password,
      salt,
      algorithm,
      iterations,
  
      // @ts-expect-error The parameter is not required in one of the overloads
      output // eslint-disable-line comma-dangle
    );
  }


  /**
   * Derives a key using the Argon2 algorithm.
   * 
   * @param password - The password to derive the key from.
   * @param salt - The salt used in the key derivation.
   * @param iterations - The number of iterations for the key derivation.
   * @param memory - The memory parameter for Argon2.
   * @param parallelism - The parallelism parameter for Argon2.
   * @param output - (Optional) The output type ('buffer', 'bytearray', or 'hex').
   * @returns A promise resolving to the derived key.
   */
  export function argon2(
    password: string | Uint8Array,
    salt: string | Uint8Array,
    iterations: number,
    memory: number,
    parallelism: number // eslint-disable-line comma-dangle
  ): Promise<Uint8Array>;
  
  /**
   * Derives a key using the Argon2 algorithm.
   * 
   * @param password - The password to derive the key from.
   * @param salt - The salt used in the key derivation.
   * @param iterations - The number of iterations for the key derivation.
   * @param memory - The memory parameter for Argon2.
   * @param parallelism - The parallelism parameter for Argon2.
   * @param output - (Optional) The output type ('buffer', 'bytearray', or 'hex').
   * @returns A promise resolving to the derived key.
   */
  export function argon2(
    password: string | Uint8Array,
    salt: string | Uint8Array,
    iterations: number,
    memory: number,
    parallelism: number,
    output: 'buffer' // eslint-disable-line comma-dangle
  ): Promise<XBuffer>;
  
  /**
   * Derives a key using the Argon2 algorithm.
   * 
   * @param password - The password to derive the key from.
   * @param salt - The salt used in the key derivation.
   * @param iterations - The number of iterations for the key derivation.
   * @param memory - The memory parameter for Argon2.
   * @param parallelism - The parallelism parameter for Argon2.
   * @param output - (Optional) The output type ('buffer', 'bytearray', or 'hex').
   * @returns A promise resolving to the derived key.
   */
  export function argon2(
    password: string | Uint8Array,
    salt: string | Uint8Array,
    iterations: number,
    memory: number,
    parallelism: number,
    output: 'bytearray' // eslint-disable-line comma-dangle
  ): Promise<Uint8Array>;
  
  /**
   * Derives a key using the Argon2 algorithm.
   * 
   * @param password - The password to derive the key from.
   * @param salt - The salt used in the key derivation.
   * @param iterations - The number of iterations for the key derivation.
   * @param memory - The memory parameter for Argon2.
   * @param parallelism - The parallelism parameter for Argon2.
   * @param output - (Optional) The output type ('buffer', 'bytearray', or 'hex').
   * @returns A promise resolving to the derived key.
   */
  export function argon2(
    password: string | Uint8Array,
    salt: string | Uint8Array,
    iterations: number,
    memory: number,
    parallelism: number,
    output: 'hex' // eslint-disable-line comma-dangle
  ): Promise<string>;
  
  /**
   * Derives a key using the Argon2 algorithm.
   * 
   * @param password - The password to derive the key from.
   * @param salt - The salt used in the key derivation.
   * @param iterations - The number of iterations for the key derivation.
   * @param memory - The memory parameter for Argon2.
   * @param parallelism - The parallelism parameter for Argon2.
   * @param output - (Optional) The output type ('buffer', 'bytearray', or 'hex').
   * @returns A promise resolving to the derived key.
   */
  export async function argon2(
    password: string | Uint8Array,
    salt: string | Uint8Array,
    iterations: number,
    memory: number,
    parallelism: number,
    output?: 'bytearray' | 'buffer' | 'hex' // eslint-disable-line comma-dangle
  ): Promise<string | XBuffer | Uint8Array> {
    if(!isBrowser()) return _node_argon2(
      password,
      salt,
      iterations,
      memory,
      parallelism,
      
      // @ts-expect-error The parameter is not required in one of the overloads
      output // eslint-disable-line comma-dangle
    );
      
    return _browser_argon2(
      password,
      salt,
      iterations,
      memory,
      parallelism,
      
      // @ts-expect-error The parameter is not required in one of the overloads
      output // eslint-disable-line comma-dangle
    );
  }

  /**
   * Derives a key using the PBKDF2 algorithm with HMAC-SHA256.
   * 
   * @param password - The password to derive the key from.
   * @param salt - The salt used in the key derivation.
   * @returns A promise resolving to the derived key.
   */
  export function fastPBKDF2HmacSHA256(
    password: string | Uint8Array,
    salt: string | Uint8Array // eslint-disable-line comma-dangle
  ): Promise<XBuffer> {
    return pbkdf2(
      password,
      salt,
      'sha256',
      100000,
      'buffer',
    );
  }
  
  /**
   * Derives a key using the PBKDF2 algorithm with HMAC-SHA512.
   * 
   * @param password - The password to derive the key from.
   * @param salt - The salt used in the key derivation.
   * @returns A promise resolving to the derived key.
   */
  export function fastPBKDF2HmacSHA512(
    password: string | Uint8Array,
    salt: string | Uint8Array // eslint-disable-line comma-dangle
  ): Promise<XBuffer> {
    return pbkdf2(
      password,
      salt,
      'sha512',
      100000,
      'buffer',
    );
  }

  /**
   * Derives a key using the Argon2 algorithm with preset parameters.
   * 
   * @param password - The password to derive the key from.
   * @param salt - The salt used in the key derivation.
   * @returns A promise resolving to the derived key.
   */
  export function fastArgon2(
    password: string | Uint8Array,
    salt: string | Uint8Array // eslint-disable-line comma-dangle
  ): Promise<XBuffer> {
    return argon2(
      password,
      salt,
      3,
      4096,
      1,
      'buffer',
    );
  }
}

export default keyd;
