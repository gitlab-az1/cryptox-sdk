export * from './otp';
export * from './totp';
export * from './keyd';
export * from './hash';
export * from './core';
export * from './errors';
export * from './embedding';



// eslint-disable-next-line @typescript-eslint/no-namespace
namespace cryptox { /* eslint-disable @typescript-eslint/no-var-requires */
  export const embedding: typeof import('./embedding').embedding = require('./embedding').embedding;
  export const errors: typeof import('./errors').errors = require('./errors').errors;

  /**
   * Namespace for PBKDF2 and Argon2 key derivation functions.
   */
  export const keyd: typeof import('./keyd').keyd = require('./keyd').keyd;

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
  export const argon2: typeof import('./keyd').argon2 = require('./keyd').argon2;

  /**
   * Derives a key using the Argon2 algorithm with preset parameters.
   * 
   * @param password - The password to derive the key from.
   * @param salt - The salt used in the key derivation.
   * @returns A promise resolving to the derived key.
   */
  export const fastArgon2: typeof import('./keyd').fastArgon2 = require('./keyd').fastArgon2;

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
  export const pbkdf2: typeof import('./keyd').pbkdf2 = require('./keyd').pbkdf2;

  /**
   * Derives a key using the PBKDF2 algorithm with HMAC-SHA256.
   * 
   * @param password - The password to derive the key from.
   * @param salt - The salt used in the key derivation.
   * @returns A promise resolving to the derived key.
   */
  export const fastPBKDF2HmacSHA256: typeof import('./keyd').fastPBKDF2HmacSHA256 = require('./keyd').fastPBKDF2HmacSHA256;

  /**
   * Derives a key using the PBKDF2 algorithm with HMAC-SHA512.
   * 
   * @param password - The password to derive the key from.
   * @param salt - The salt used in the key derivation.
   * @returns A promise resolving to the derived key.
   */
  export const fastPBKDF2HmacSHA512: typeof import('./keyd').fastPBKDF2HmacSHA512 = require('./keyd').fastPBKDF2HmacSHA512;

  /**
   * A namespace providing hashing and HMAC functions.
   * @namespace hasher
   */
  export const hasher: typeof import('./hash').hasher = require('./hash').hasher;

  /**
   * Computes cryptographic hash using the appropriate method based on the environment.
   * 
   * @param value - The data to be hashed.
   * @param algorithm - The hash algorithm to use ('sha1', 'sha256', 'sha512', or 'md5').
   * @param output - (Optional) The desired output format ('buffer', 'hex', or 'bytearray').
   * @returns {Promise<string | Uint8Array | XBuffer>} - A promise resolving to the hash value.
   */
  export const hash: typeof import('./hash').hash = require('./hash').hash;

  /**
   * Computes HMAC (Hash-based Message Authentication Code) using the appropriate method based on the environment.
   * 
   * @param value - The data to be hashed.
   * @param key - The secret key for the HMAC computation.
   * @param algorithm - The hash algorithm to use ('sha1', 'sha256', or 'sha512').
   * @param output - (Optional) The desired output format ('buffer', 'hex', or 'bytearray').
   * @returns {Promise<string | Uint8Array | XBuffer>} - A promise resolving to the HMAC value.
   */
  export const hmac: typeof import('./hash').hmac = require('./hash').hmac;

  /**
   * Generates cryptographically secure random values into the provided Uint8Array.
   * 
   * If the crypto API is available, it uses `crypto.getRandomValues`, else it generates
   * random values using a custom math library.
   * 
   * @param bucket - The Uint8Array to fill with random values.
   * @returns A Uint8Array filled with random values.
   */
  export const getRandomValues: typeof import('./core').getRandomValues = require('./core').getRandomValues;

  /**
   * Concatenates two Uint8Array objects into a single Uint8Array.
   * 
   * @param arr1 - The first Uint8Array to concatenate.
   * @param arr2 - The second Uint8Array to concatenate.
   * @returns A new Uint8Array containing the concatenated values of arr1 and arr2.
   */
  export const concatArrays: typeof import('./core').concatArrays = require('./core').concatArrays;

  /**
   * Converts a number to a Uint8Array representing its binary representation.
   * 
   * @param value - The number to convert.
   * @returns A Uint8Array representing the binary representation of the input number.
   */
  export const intToByteArray: typeof import('./core').intToByteArray = require('./core').intToByteArray;

  /**
   * Converts a number to an array of bytes representing its binary representation.
   * 
   * @param value - The number to convert.
   * @returns An array of bytes representing the binary representation of the input number.
   */
  export const intToBytes: typeof import('./core').intToBytes = require('./core').intToBytes;

  /**
   * Converts a number to its binary representation based on the specified encoding.
   * 
   * @param value - The number to convert.
   * @param encoding - The encoding type ('bytes' or 'bytearray').
   * @returns An array of bytes or a Uint8Array representing the binary representation of the input number.
   * @throws Error if the encoding type is unknown.
   */
  export const intToBinary: typeof import('./core').intToBinary = require('./core').intToBinary;

  /**
   * Computes the HMAC-SHA1 message authentication code using the provided key and message.
   * 
   * @param key - The key for HMAC calculation.
   * @param message - The message for HMAC calculation.
   * @returns A Uint8Array representing the HMAC-SHA1 hash.
   */
  export const hmacSHA1: typeof import('./core').hmacSHA1 = require('./core').hmacSHA1;

  /**
   * Decodes a Base32 encoded string into a Uint8Array.
   * 
   * @param encoded - The Base32 encoded string to decode.
   * @returns A Uint8Array representing the decoded data.
   * @throws Error if the input contains invalid Base32 characters.
   */
  export const base32Decode: typeof import('./core').base32Decode = require('./core').base32Decode;

  /**
   * Performs a circular left shift (rotate left) operation on a number.
   * 
   * @param n - The number to perform the rotation on.
   * @param s - The number of bits to rotate by.
   * @returns The result of the rotation operation.
   */
  export const rotl: typeof import('./core').rotl = require('./core').rotl;

  /**
   * Computes the SHA-1 hash of the provided message.
   * 
   * @param message - The message to hash.
   * @returns A Uint8Array representing the SHA-1 hash of the message.
   */
  export const sha1: typeof import('./core').sha1 = require('./core').sha1;

  /**
   * Performs a binary comparison between two Uint8Arrays.
   * 
   * @param a - The first Uint8Array to compare.
   * @param b - The second Uint8Array to compare.
   * @returns {boolean} - True if the arrays are equal, false otherwise.
   */
  export const binaryCompare: typeof import('./core').binaryCompare = require('./core').binaryCompare;

  /**
   * Performs a deep comparison between two Uint8Arrays using HMAC.
   * 
   * @param a - The first Uint8Array to compare.
   * @param b - The second Uint8Array to compare.
   * @returns {Promise<boolean>} - A promise resolving to true if the arrays are equal, false otherwise.
   */
  export const deepCompare: typeof import('./core').deepCompare = require('./core').deepCompare;

  /**
   * Generates cryptographically secure random bytes.
   * 
   * @param length - The number of random bytes to generate.
   * @returns {Promise<Uint8Array>} - A promise resolving to a Uint8Array containing the random bytes.
   */
  export const randomBytes: typeof import('./core').randomBytes = require('./core').randomBytes;

  /**
   * TOTP32 class for generating and validating Time-based One-Time Passwords (TOTP) using the SHA1 algorithm.
   */
  export const TOTP32: typeof import('./totp').TOTP32 = require('./totp').TOTP32;

  /**
   * TOTP64 class for generating and validating Time-based One-Time Passwords (TOTP) using the SHA1 algorithm with base64 encoding.
   */
  export const TOTP64: typeof import('./totp').TOTP64 = require('./totp').TOTP64;

  /**
   * Generates a Time-based One-Time Password (TOTP) using either TOTP32 or TOTP64 based on environment support.
   * 
   * @param secret The secret key used for generating the TOTP.
   * @param windowSize The time window in seconds (default is 30 seconds).
   * @param timeOffset The time offset in seconds (default is 0).
   * @returns The generated TOTP code.
   */
  export const generateTOTP: typeof import('./totp').generateTOTP = require('./totp').generateTOTP;

  /**
   * Validates a Time-based One-Time Password (TOTP) using either TOTP32 or TOTP64 based on environment support.
   * 
   * @param otp The TOTP code to validate.
   * @param secret The secret key used for generating the TOTP.
   * @param windowSize The time window in seconds (default is 30 seconds).
   * @param timeOffset The time offset in seconds (default is 0).
   * @returns A boolean indicating whether the TOTP code is valid.
   */
  export const validateTOTP: typeof import('./totp').validateTOTP = require('./totp').validateTOTP;

  /**
   * OTP32 class for generating and validating One-Time Passwords (OTP) using the SHA1 algorithm with base32 encoding.
   */
  export const OTP32: typeof import('./otp').OTP32 = require('./otp').OTP32;

  /**
   * OTP64 class for generating and validating One-Time Passwords (OTP) using the SHA1 algorithm with base64 encoding.
   */
  export const OTP64: typeof import('./otp').OTP64 = require('./otp').OTP64;

  /**
   * Generates a One-Time Password (OTP) using either OTP32 or OTP64 based on environment support.
   * 
   * @param secret The secret key used for generating the OTP.
   * @param length The length of the OTP (default is 6).
   * @returns The generated OTP.
   */
  export const generateOTP: typeof import('./otp').generateOTP = require('./otp').generateOTP;

  /**
   * Validates a One-Time Password (OTP) using either OTP32 or OTP64 based on environment support.
   * 
   * @param otp The OTP to validate.
   * @param secret The secret key used for generating the OTP.
   * @param validDuration The validity duration of the OTP in seconds (default is 30 seconds).
   * @returns A boolean indicating whether the OTP is valid.
   */
  export const validateOTP: typeof import('./otp').validateOTP = require('./otp').validateOTP;

  /**
   * Represents the options for configuring a PostgresEmbeddingExtension.
   */
  export type PostgresEmbeddingExtensionOptions = import('./embedding/extensions/postgresql').PostgresEmbeddingExtensionOptions;

  /**
   * Represents the options for creating a PostgresEmbeddingTextWorker.
   */
  export type PostgresEmbeddingTextWorkerOptions = import('./embedding/extensions/postgresql').PostgresEmbeddingTextWorkerOptions;

  /**
   * Represents the schema of a database, where each table name is mapped to its column names and types.
   */
  export type DatabaseSchema = import('./embedding/extensions/postgresql').DatabaseSchema; 

  /**
   * Represents the results of a database lookup operation, including the matched data and cosine similarity.
   */
  export type LookupResults<S extends DatabaseSchema, K extends keyof S> = import('./embedding/extensions/postgresql').LookupResults<S, K>;

  /**
   * Represents a PostgreSQL database extension for handling embeddings.
   */
  export const PostgresEmbeddingExtension: typeof import('./embedding/extensions/postgresql').PostgresEmbeddingExtension = require('./embedding/extensions/postgresql').PostgresEmbeddingExtension;
} /* eslint-enable @typescript-eslint/no-var-requires */

export default cryptox;
