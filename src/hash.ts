import XBuffer from './_internal/resources/buffer';

import {
  isBrowser,
  toNodeValue,
  toByteString,
  toUint8Buffer,
  toWebCryptoAlgorithm,
  fromByteStringToArray,
} from './_internal/utils';


function _node_hmac(
  value: Uint8Array,
  key: Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512' // eslint-disable-line comma-dangle
): Promise<Uint8Array>;

function _node_hmac(
  value: Uint8Array,
  key: Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512',
  output: 'buffer' // eslint-disable-line comma-dangle
): Promise<XBuffer>;

function _node_hmac(
  value: Uint8Array,
  key: Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512',
  output: 'hex' // eslint-disable-line comma-dangle
): Promise<string>;

function _node_hmac(
  value: Uint8Array,
  key: Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512',
  output: 'bytearray' // eslint-disable-line comma-dangle
): Promise<Uint8Array>;


async function _node_hmac(
  value: Uint8Array,
  key: Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512',
  output?: 'buffer' | 'hex' | 'bytearray' // eslint-disable-line comma-dangle
): Promise<Uint8Array | XBuffer | string> {
  const { createHmac } = await import('crypto');

  const mac = createHmac(algorithm, Buffer.from(key));
  mac.update(Buffer.from(value));

  const result = mac.digest();
  const uint8Array = toUint8Buffer(result);

  if(!output || output === 'bytearray') return uint8Array;
  if(output === 'buffer') return XBuffer.fromUint8Array(uint8Array);
  if(output === 'hex') return XBuffer.fromUint8Array(uint8Array).toString('hex');

  throw new TypeError(`Invalid output format: ${output}`);
}


function _browser_hmac(
  subtle: SubtleCrypto,
  value: Uint8Array,
  key: Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512' // eslint-disable-line comma-dangle
): Promise<Uint8Array>;

function _browser_hmac(
  subtle: SubtleCrypto,
  value: Uint8Array,
  key: Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512',
  output: 'buffer' // eslint-disable-line comma-dangle
): Promise<XBuffer>;

function _browser_hmac(
  subtle: SubtleCrypto,
  value: Uint8Array,
  key: Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512',
  output: 'hex' // eslint-disable-line comma-dangle
): Promise<string>;

function _browser_hmac(
  subtle: SubtleCrypto,
  value: Uint8Array,
  key: Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512',
  output: 'bytearray' // eslint-disable-line comma-dangle
): Promise<Uint8Array>;


async function _browser_hmac(
  subtle: SubtleCrypto,
  value: Uint8Array,
  key: Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512',
  output?: 'buffer' | 'hex' | 'bytearray' // eslint-disable-line comma-dangle
): Promise<string | Uint8Array | XBuffer> {
  const signingAlgorithm = {
    name: 'HMAC',
    hash: { name: toWebCryptoAlgorithm(algorithm) },
  };

  const k = await subtle.importKey('raw', key, signingAlgorithm, false, ['sign']);
  const o = await subtle.sign(signingAlgorithm, k, value);

  const uint8Array = new Uint8Array(o);

  if(!output || output === 'bytearray') return uint8Array;
  if(output === 'buffer') return XBuffer.fromUint8Array(uint8Array);
  if(output === 'hex') return XBuffer.fromUint8Array(uint8Array).toString('hex');
    
  throw new TypeError(`Invalid output format: ${output}`);
}


/**
 * Computes HMAC (Hash-based Message Authentication Code) using the appropriate method based on the environment.
 * 
 * @param value - The data to be hashed.
 * @param key - The secret key for the HMAC computation.
 * @param algorithm - The hash algorithm to use ('sha1', 'sha256', or 'sha512').
 * @param output - (Optional) The desired output format ('buffer', 'hex', or 'bytearray').
 * @returns {Promise<string | Uint8Array | XBuffer>} - A promise resolving to the HMAC value.
 */
export function hmac(
  value: Uint8Array,
  key: Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512' // eslint-disable-line comma-dangle
): Promise<Uint8Array>;


/**
 * Computes HMAC (Hash-based Message Authentication Code) using the appropriate method based on the environment.
 * 
 * @param value - The data to be hashed.
 * @param key - The secret key for the HMAC computation.
 * @param algorithm - The hash algorithm to use ('sha1', 'sha256', or 'sha512').
 * @param output - (Optional) The desired output format ('buffer', 'hex', or 'bytearray').
 * @returns {Promise<string | Uint8Array | XBuffer>} - A promise resolving to the HMAC value.
 */
export function hmac(
  value: Uint8Array,
  key: Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512',
  output: 'buffer' // eslint-disable-line comma-dangle
): Promise<XBuffer>;


/**
 * Computes HMAC (Hash-based Message Authentication Code) using the appropriate method based on the environment.
 * 
 * @param value - The data to be hashed.
 * @param key - The secret key for the HMAC computation.
 * @param algorithm - The hash algorithm to use ('sha1', 'sha256', or 'sha512').
 * @param output - (Optional) The desired output format ('buffer', 'hex', or 'bytearray').
 * @returns {Promise<string | Uint8Array | XBuffer>} - A promise resolving to the HMAC value.
 */
export function hmac(
  value: Uint8Array,
  key: Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512',
  output: 'hex' // eslint-disable-line comma-dangle
): Promise<string>;


/**
 * Computes HMAC (Hash-based Message Authentication Code) using the appropriate method based on the environment.
 * 
 * @param value - The data to be hashed.
 * @param key - The secret key for the HMAC computation.
 * @param algorithm - The hash algorithm to use ('sha1', 'sha256', or 'sha512').
 * @param output - (Optional) The desired output format ('buffer', 'hex', or 'bytearray').
 * @returns {Promise<string | Uint8Array | XBuffer>} - A promise resolving to the HMAC value.
 */
export function hmac(
  value: Uint8Array,
  key: Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512',
  output: 'bytearray' // eslint-disable-line comma-dangle
): Promise<Uint8Array>;


/**
 * Computes HMAC (Hash-based Message Authentication Code) using the appropriate method based on the environment.
 * 
 * @param value - The data to be hashed.
 * @param key - The secret key for the HMAC computation.
 * @param algorithm - The hash algorithm to use ('sha1', 'sha256', or 'sha512').
 * @param output - (Optional) The desired output format ('buffer', 'hex', or 'bytearray').
 * @returns {Promise<string | Uint8Array | XBuffer>} - A promise resolving to the HMAC value.
 */
export function hmac(
  value: Uint8Array,
  key: Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512',
  output?: 'buffer' | 'hex' | 'bytearray' // eslint-disable-line comma-dangle
): Promise<string | Uint8Array | XBuffer> {
  if(!isBrowser()) return _node_hmac(
    value,
    key,
    algorithm,

    // @ts-expect-error The parameter is not required in one of the overloads
    output // eslint-disable-line comma-dangle
  );

  const crypto = typeof window.crypto !== 'undefined' ? window.crypto : null;
  const subtle = !!crypto && typeof window.crypto.subtle !== 'undefined' ? window.crypto.subtle : null;
  
  if(!subtle) {
    throw new Error('WebCrypto is not supported in this environment.');
  }

  return _browser_hmac(
    subtle,
    value,
    key,
    algorithm,

    // @ts-expect-error The parameter is not required in one of the overloads
    output // eslint-disable-line comma-dangle
  );
}


function _node_hash(
  value: string | Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512' | 'md5',
): Promise<Uint8Array>;

function _node_hash(
  value: string | Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512' | 'md5',
  output: 'buffer',
): Promise<XBuffer>;

function _node_hash(
  value: string | Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512' | 'md5',
  output: 'hex',
): Promise<string>;

function _node_hash(
  value: string | Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512' | 'md5',
  output: 'bytearray',
): Promise<Uint8Array>;


async function _node_hash(
  value: string | Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512' | 'md5',
  output?: 'buffer' | 'hex' | 'bytearray' // eslint-disable-line comma-dangle
): Promise<string | Uint8Array | XBuffer> {
  const { createHash } = await import('crypto');

  const h = createHash(algorithm);
  h.update(toNodeValue(value));

  const uint8Array = toUint8Buffer(h.digest());

  if(!output || output === 'bytearray') return uint8Array;
  if(output === 'buffer') return XBuffer.fromUint8Array(uint8Array);
  if(output === 'hex') return XBuffer.fromUint8Array(uint8Array).toString('hex');

  throw new TypeError(`Invalid output format: ${output}`);
}

function _browser_hash(
  subtle: SubtleCrypto,
  value: string | Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512' | 'md5' // eslint-disable-line comma-dangle
): Promise<Uint8Array>;

function _browser_hash(
  subtle: SubtleCrypto,
  value: string | Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512' | 'md5',
  output: 'buffer' // eslint-disable-line comma-dangle
): Promise<XBuffer>;

function _browser_hash(
  subtle: SubtleCrypto,
  value: string | Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512' | 'md5',
  output: 'hex' // eslint-disable-line comma-dangle
): Promise<string>;

function _browser_hash(
  subtle: SubtleCrypto,
  value: string | Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512' | 'md5',
  output: 'bytearray' // eslint-disable-line comma-dangle
): Promise<Uint8Array>;

async function _browser_hash(
  subtle: SubtleCrypto,
  value: string | Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512' | 'md5',
  output?: 'buffer' | 'hex' | 'bytearray' // eslint-disable-line comma-dangle
): Promise<string | Uint8Array | XBuffer> {
  const _createForgeHash = async (): Promise<string | Uint8Array | XBuffer> => {
    const { md } = await import('node-forge');
    const h = md[algorithm === 'md5' ? 'md5' : 'sha1'].create();

    const bytes = await toByteString(value);
    h.update(bytes, 'raw');

    const uint8Array = fromByteStringToArray(h.digest().data);

    if(!output || output === 'bytearray') return uint8Array;
    if(output === 'buffer') return XBuffer.fromUint8Array(uint8Array);
    if(output === 'hex') return XBuffer.fromUint8Array(uint8Array).toString('hex');

    throw new TypeError(`Invalid output format: ${output}`);
  };

  if(algorithm === 'md5' || algorithm === 'sha1') return _createForgeHash();

  const o = await subtle.digest(
    { name: toWebCryptoAlgorithm(algorithm) },
    toUint8Buffer(value) // eslint-disable-line comma-dangle
  );

  const uint8Array = new Uint8Array(o);

  if(!output || output === 'bytearray') return uint8Array;
  if(output === 'buffer') return XBuffer.fromUint8Array(uint8Array);
  if(output === 'hex') return XBuffer.fromUint8Array(uint8Array).toString('hex');

  throw new TypeError(`Invalid output format: ${output}`);
}


/**
 * Computes cryptographic hash using the appropriate method based on the environment.
 * 
 * @param value - The data to be hashed.
 * @param algorithm - The hash algorithm to use ('sha1', 'sha256', 'sha512', or 'md5').
 * @param output - (Optional) The desired output format ('buffer', 'hex', or 'bytearray').
 * @returns {Promise<string | Uint8Array | XBuffer>} - A promise resolving to the hash value.
 */
export function hash(
  value: string | Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512' | 'md5' // eslint-disable-line comma-dangle
): Promise<Uint8Array>;

/**
 * Computes cryptographic hash using the appropriate method based on the environment.
 * 
 * @param value - The data to be hashed.
 * @param algorithm - The hash algorithm to use ('sha1', 'sha256', 'sha512', or 'md5').
 * @param output - (Optional) The desired output format ('buffer', 'hex', or 'bytearray').
 * @returns {Promise<string | Uint8Array | XBuffer>} - A promise resolving to the hash value.
 */
export function hash(
  value: string | Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512' | 'md5',
  output: 'buffer' // eslint-disable-line comma-dangle
): Promise<XBuffer>;

/**
 * Computes cryptographic hash using the appropriate method based on the environment.
 * 
 * @param value - The data to be hashed.
 * @param algorithm - The hash algorithm to use ('sha1', 'sha256', 'sha512', or 'md5').
 * @param output - (Optional) The desired output format ('buffer', 'hex', or 'bytearray').
 * @returns {Promise<string | Uint8Array | XBuffer>} - A promise resolving to the hash value.
 */
export function hash(
  value: string | Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512' | 'md5',
  output: 'hex' // eslint-disable-line comma-dangle
): Promise<string>;

/**
 * Computes cryptographic hash using the appropriate method based on the environment.
 * 
 * @param value - The data to be hashed.
 * @param algorithm - The hash algorithm to use ('sha1', 'sha256', 'sha512', or 'md5').
 * @param output - (Optional) The desired output format ('buffer', 'hex', or 'bytearray').
 * @returns {Promise<string | Uint8Array | XBuffer>} - A promise resolving to the hash value.
 */
export function hash(
  value: string | Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512' | 'md5',
  output: 'bytearray' // eslint-disable-line comma-dangle
): Promise<Uint8Array>;


/**
 * Computes cryptographic hash using the appropriate method based on the environment.
 * 
 * @param value - The data to be hashed.
 * @param algorithm - The hash algorithm to use ('sha1', 'sha256', 'sha512', or 'md5').
 * @param output - (Optional) The desired output format ('buffer', 'hex', or 'bytearray').
 * @returns {Promise<string | Uint8Array | XBuffer>} - A promise resolving to the hash value.
 */
export function hash(
  value: string | Uint8Array,
  algorithm: 'sha1' | 'sha256' | 'sha512' | 'md5',
  output?: 'buffer' | 'hex' | 'bytearray' // eslint-disable-line comma-dangle
): Promise<string | Uint8Array | XBuffer> {
  if(!isBrowser()) return _node_hash(
    value,
    algorithm,

    // @ts-expect-error The parameter is not required in one of the overloads
    output // eslint-disable-line comma-dangle
  );

  const crypto = typeof window.crypto !== 'undefined' ? window.crypto : null;
  const subtle = !!crypto && typeof window.crypto.subtle !== 'undefined' ? window.crypto.subtle : null;
  
  if(!subtle) {
    throw new Error('WebCrypto is not supported in this environment.');
  }

  return _browser_hash(
    subtle,
    value,
    algorithm,
    
    // @ts-expect-error The parameter is not required in one of the overloads
    output // eslint-disable-line comma-dangle
  );
}




/**
 * A namespace providing hashing and HMAC functions.
 * @namespace hasher
 */
export namespace hasher { // eslint-disable-line @typescript-eslint/no-namespace

  /**
   * Computes cryptographic hash using the appropriate method based on the environment.
   * 
   * @param value - The data to be hashed.
   * @param algorithm - The hash algorithm to use ('sha1', 'sha256', 'sha512', or 'md5').
   * @param output - (Optional) The desired output format ('buffer', 'hex', or 'bytearray').
   * @returns {Promise<string | Uint8Array | XBuffer>} - A promise resolving to the hash value.
   */
  export function hash(
    value: string | Uint8Array,
    algorithm: 'sha1' | 'sha256' | 'sha512' | 'md5' // eslint-disable-line comma-dangle
  ): Promise<Uint8Array>;
  

  /**
   * Computes cryptographic hash using the appropriate method based on the environment.
   * 
   * @param value - The data to be hashed.
   * @param algorithm - The hash algorithm to use ('sha1', 'sha256', 'sha512', or 'md5').
   * @param output - (Optional) The desired output format ('buffer', 'hex', or 'bytearray').
   * @returns {Promise<string | Uint8Array | XBuffer>} - A promise resolving to the hash value.
   */
  export function hash(
    value: string | Uint8Array,
    algorithm: 'sha1' | 'sha256' | 'sha512' | 'md5',
    output: 'buffer' // eslint-disable-line comma-dangle
  ): Promise<XBuffer>;
  
  /**
   * Computes cryptographic hash using the appropriate method based on the environment.
   * 
   * @param value - The data to be hashed.
   * @param algorithm - The hash algorithm to use ('sha1', 'sha256', 'sha512', or 'md5').
   * @param output - (Optional) The desired output format ('buffer', 'hex', or 'bytearray').
   * @returns {Promise<string | Uint8Array | XBuffer>} - A promise resolving to the hash value.
   */
  export function hash(
    value: string | Uint8Array,
    algorithm: 'sha1' | 'sha256' | 'sha512' | 'md5',
    output: 'hex' // eslint-disable-line comma-dangle
  ): Promise<string>;
  

  /**
   * Computes cryptographic hash using the appropriate method based on the environment.
   * 
   * @param value - The data to be hashed.
   * @param algorithm - The hash algorithm to use ('sha1', 'sha256', 'sha512', or 'md5').
   * @param output - (Optional) The desired output format ('buffer', 'hex', or 'bytearray').
   * @returns {Promise<string | Uint8Array | XBuffer>} - A promise resolving to the hash value.
   */
  export function hash(
    value: string | Uint8Array,
    algorithm: 'sha1' | 'sha256' | 'sha512' | 'md5',
    output: 'bytearray' // eslint-disable-line comma-dangle
  ): Promise<Uint8Array>;
  
  
  /**
   * Computes cryptographic hash using the appropriate method based on the environment.
   * 
   * @param value - The data to be hashed.
   * @param algorithm - The hash algorithm to use ('sha1', 'sha256', 'sha512', or 'md5').
   * @param output - (Optional) The desired output format ('buffer', 'hex', or 'bytearray').
   * @returns {Promise<string | Uint8Array | XBuffer>} - A promise resolving to the hash value.
   */
  export function hash(
    value: string | Uint8Array,
    algorithm: 'sha1' | 'sha256' | 'sha512' | 'md5',
    output?: 'buffer' | 'hex' | 'bytearray' // eslint-disable-line comma-dangle
  ): Promise<string | Uint8Array | XBuffer> {
    if(!isBrowser()) return _node_hash(
      value,
      algorithm,
  
      // @ts-expect-error The parameter is not required in one of the overloads
      output // eslint-disable-line comma-dangle
    );
  
    const crypto = typeof window.crypto !== 'undefined' ? window.crypto : null;
    const subtle = !!crypto && typeof window.crypto.subtle !== 'undefined' ? window.crypto.subtle : null;
    
    if(!subtle) {
      throw new Error('WebCrypto is not supported in this environment.');
    }
  
    return _browser_hash(
      subtle,
      value,
      algorithm,
      
      // @ts-expect-error The parameter is not required in one of the overloads
      output // eslint-disable-line comma-dangle
    );
  }
  
  /**
   * Computes HMAC (Hash-based Message Authentication Code) using the appropriate method based on the environment.
   * 
   * @param value - The data to be hashed.
   * @param key - The secret key for the HMAC computation.
   * @param algorithm - The hash algorithm to use ('sha1', 'sha256', or 'sha512').
   * @param output - (Optional) The desired output format ('buffer', 'hex', or 'bytearray').
   * @returns {Promise<string | Uint8Array | XBuffer>} - A promise resolving to the HMAC value.
   */
  export function hmac(
    value: Uint8Array,
    key: Uint8Array,
    algorithm: 'sha1' | 'sha256' | 'sha512' // eslint-disable-line comma-dangle
  ): Promise<Uint8Array>;
  
  /**
   * Computes HMAC (Hash-based Message Authentication Code) using the appropriate method based on the environment.
   * 
   * @param value - The data to be hashed.
   * @param key - The secret key for the HMAC computation.
   * @param algorithm - The hash algorithm to use ('sha1', 'sha256', or 'sha512').
   * @param output - (Optional) The desired output format ('buffer', 'hex', or 'bytearray').
   * @returns {Promise<string | Uint8Array | XBuffer>} - A promise resolving to the HMAC value.
   */
  export function hmac(
    value: Uint8Array,
    key: Uint8Array,
    algorithm: 'sha1' | 'sha256' | 'sha512',
    output: 'buffer' // eslint-disable-line comma-dangle
  ): Promise<XBuffer>;
  
  /**
   * Computes HMAC (Hash-based Message Authentication Code) using the appropriate method based on the environment.
   * 
   * @param value - The data to be hashed.
   * @param key - The secret key for the HMAC computation.
   * @param algorithm - The hash algorithm to use ('sha1', 'sha256', or 'sha512').
   * @param output - (Optional) The desired output format ('buffer', 'hex', or 'bytearray').
   * @returns {Promise<string | Uint8Array | XBuffer>} - A promise resolving to the HMAC value.
   */
  export function hmac(
    value: Uint8Array,
    key: Uint8Array,
    algorithm: 'sha1' | 'sha256' | 'sha512',
    output: 'hex' // eslint-disable-line comma-dangle
  ): Promise<string>;
  
  /**
   * Computes HMAC (Hash-based Message Authentication Code) using the appropriate method based on the environment.
   * 
   * @param value - The data to be hashed.
   * @param key - The secret key for the HMAC computation.
   * @param algorithm - The hash algorithm to use ('sha1', 'sha256', or 'sha512').
   * @param output - (Optional) The desired output format ('buffer', 'hex', or 'bytearray').
   * @returns {Promise<string | Uint8Array | XBuffer>} - A promise resolving to the HMAC value.
   */
  export function hmac(
    value: Uint8Array,
    key: Uint8Array,
    algorithm: 'sha1' | 'sha256' | 'sha512',
    output: 'bytearray' // eslint-disable-line comma-dangle
  ): Promise<Uint8Array>;
  
  
  /**
   * Computes HMAC (Hash-based Message Authentication Code) using the appropriate method based on the environment.
   * 
   * @param value - The data to be hashed.
   * @param key - The secret key for the HMAC computation.
   * @param algorithm - The hash algorithm to use ('sha1', 'sha256', or 'sha512').
   * @param output - (Optional) The desired output format ('buffer', 'hex', or 'bytearray').
   * @returns {Promise<string | Uint8Array | XBuffer>} - A promise resolving to the HMAC value.
   */
  export function hmac(
    value: Uint8Array,
    key: Uint8Array,
    algorithm: 'sha1' | 'sha256' | 'sha512',
    output?: 'buffer' | 'hex' | 'bytearray' // eslint-disable-line comma-dangle
  ): Promise<string | Uint8Array | XBuffer> {
    if(!isBrowser()) return _node_hmac(
      value,
      key,
      algorithm,
  
      // @ts-expect-error The parameter is not required in one of the overloads
      output // eslint-disable-line comma-dangle
    );
  
    const crypto = typeof window.crypto !== 'undefined' ? window.crypto : null;
    const subtle = !!crypto && typeof window.crypto.subtle !== 'undefined' ? window.crypto.subtle : null;
    
    if(!subtle) {
      throw new Error('WebCrypto is not supported in this environment.');
    }
  
    return _browser_hmac(
      subtle,
      value,
      key,
      algorithm,
  
      // @ts-expect-error The parameter is not required in one of the overloads
      output // eslint-disable-line comma-dangle
    );
  }
}

export default hasher;
