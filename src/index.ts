export * from './otp';
export * from './totp';
export * from './core';
export * from './errors';
export * from './embedding';



// eslint-disable-next-line @typescript-eslint/no-namespace
namespace cryptox { /* eslint-disable @typescript-eslint/no-var-requires */
  export const embedding: typeof import('./embedding').embedding = require('./embedding').embedding;
  export const errors: typeof import('./errors').errors = require('./errors').errors;
  export const getRandomValues: typeof import('./core').getRandomValues = require('./core').getRandomValues;
  export const concatArrays: typeof import('./core').concatArrays = require('./core').concatArrays;
  export const intToByteArray: typeof import('./core').intToByteArray = require('./core').intToByteArray;
  export const intToBytes: typeof import('./core').intToBytes = require('./core').intToBytes;
  export const intToBinary: typeof import('./core').intToBinary = require('./core').intToBinary;
  export const hmacSHA1: typeof import('./core').hmacSHA1 = require('./core').hmacSHA1;
  export const base32Decode: typeof import('./core').base32Decode = require('./core').base32Decode;
  export const rotl: typeof import('./core').rotl = require('./core').rotl;
  export const sha1: typeof import('./core').sha1 = require('./core').sha1;
  export const TOTP32: typeof import('./totp').TOTP32 = require('./totp').TOTP32;
  export const TOTP64: typeof import('./totp').TOTP64 = require('./totp').TOTP64;
  export const generateTOTP: typeof import('./totp').generateTOTP = require('./totp').generateTOTP;
  export const validateTOTP: typeof import('./totp').validateTOTP = require('./totp').validateTOTP;
  export const OTP32: typeof import('./otp').OTP32 = require('./otp').OTP32;
  export const OTP64: typeof import('./otp').OTP64 = require('./otp').OTP64;
  export const generateOTP: typeof import('./otp').generateOTP = require('./otp').generateOTP;
  export const validateOTP: typeof import('./otp').validateOTP = require('./otp').validateOTP;
  export type PostgresEmbeddingExtensionOptions = import('./embedding/extensions/postgresql').PostgresEmbeddingExtensionOptions;
  export type PostgresEmbeddingTextWorkerOptions = import('./embedding/extensions/postgresql').PostgresEmbeddingTextWorkerOptions;
  export type DatabaseSchema = import('./embedding/extensions/postgresql').DatabaseSchema; 
  export type LookupResults<S extends DatabaseSchema, K extends keyof S> = import('./embedding/extensions/postgresql').LookupResults<S, K>;
} /* eslint-enable @typescript-eslint/no-var-requires */

export default cryptox;
