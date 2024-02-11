export * from './aes';
export * from './chacha20';

export { type KeyUsage, SymmetricKey, type SymmetricKeyOptions } from './SymmetricKey';
export { type Block, BlockCipher, type BlockCipherOptions, BlockResult } from './BlockCipher';



// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace symmetric {/* eslint-disable @typescript-eslint/no-var-requires */
  export const AES: typeof import('./aes').AES = require('./aes').AES;
  export type SupportedAESVariants = import('./aes').SupportedAESVariants;
  export const ChaCha20: typeof import('./chacha20').ChaCha20 = require('./chacha20').ChaCha20;
  export type KeyUsage = import('./SymmetricKey').KeyUsage;
  export const SymmetricKey: typeof import('./SymmetricKey').SymmetricKey = require('./SymmetricKey').SymmetricKey;
  export type SymmetricKeyOptions = import('./SymmetricKey').SymmetricKeyOptions;
  export type Block = import('./BlockCipher').Block;
  export const BlockCipher: typeof import('./BlockCipher').BlockCipher = require('./BlockCipher').BlockCipher;
  export type BlockCipherOptions = import('./BlockCipher').BlockCipherOptions;
}

export default symmetric;
