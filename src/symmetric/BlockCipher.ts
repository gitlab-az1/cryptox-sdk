import { isPlainObject } from 'typesdk/utils/is';

import ChaCha20 from './chacha20';
import { Exception } from '../errors';
import SymmetricKey from './SymmetricKey';
import { isBrowser } from '../_internal/utils';
import AES, { SupportedAESVariants } from './aes';
import Slicer from '../_internal/resources/Slicer';
import XBuffer from '../buffer';
import { Decrypted, LegacyCipher, SymmetricAlgorithm } from './core';



export type Block = {
  readonly index: number;
  readonly hash: string;
  readonly data: string;
}

export interface BlockResult {
  readonly checksum: string;
  readonly timestamp: number;
  readonly blocks: readonly Block[];
}

export type BlockCipherOptions = {
  blockSize?: number;
}


export class BlockCipher {
  readonly #cipher: LegacyCipher;
  #options: BlockCipherOptions;

  constructor(algorithm: SymmetricAlgorithm, key: Uint8Array, options?: BlockCipherOptions);
  constructor(key: SymmetricKey, options?: BlockCipherOptions);
  constructor(cipher: LegacyCipher, options?: BlockCipherOptions);
  constructor(
    cipherOrKeyOrAlgorithm: SymmetricAlgorithm | SymmetricKey | LegacyCipher,
    keyOrOptions?: Uint8Array | BlockCipherOptions,
    options?: BlockCipherOptions // eslint-disable-line comma-dangle
  ) {
    let c: LegacyCipher;
    let o: BlockCipherOptions;

    if(typeof cipherOrKeyOrAlgorithm === 'string') {
      const k = new SymmetricKey(keyOrOptions as Uint8Array, {
        algorithm: cipherOrKeyOrAlgorithm as SymmetricAlgorithm,
      });

      if(cipherOrKeyOrAlgorithm.toLowerCase().includes('aes')) {
        c = new AES(k, cipherOrKeyOrAlgorithm as SupportedAESVariants);
      } else if(cipherOrKeyOrAlgorithm === 'chacha20-poly1305') {
        c = new ChaCha20(k);
      } else {
        throw new TypeError(`Unsupported algorithm: ${cipherOrKeyOrAlgorithm}`);
      }

      o = (options as BlockCipherOptions | undefined) ?? {};
    } else if(cipherOrKeyOrAlgorithm instanceof SymmetricKey) {
      if(cipherOrKeyOrAlgorithm.algorithm.toLowerCase().includes('aes')) {
        c = new AES(cipherOrKeyOrAlgorithm, cipherOrKeyOrAlgorithm.algorithm as SupportedAESVariants);
      } else if(cipherOrKeyOrAlgorithm.algorithm === 'chacha20-poly1305') {
        c = new ChaCha20(cipherOrKeyOrAlgorithm);
      } else {
        throw new TypeError(`Unsupported algorithm: ${cipherOrKeyOrAlgorithm.algorithm}`);
      }
    
      o = (keyOrOptions as BlockCipherOptions | undefined) ?? {};
    } else {
      if(typeof cipherOrKeyOrAlgorithm !== 'object') {
        throw new TypeError(`Unsupported cipher: ${typeof cipherOrKeyOrAlgorithm}`);
      }

      if(typeof cipherOrKeyOrAlgorithm.decrypt !== 'function') {
        throw new TypeError('Invalid cipher');
      }

      if(typeof cipherOrKeyOrAlgorithm.encrypt !== 'function') {
        throw new TypeError('Invalid cipher');
      }

      c = cipherOrKeyOrAlgorithm;
      o = (keyOrOptions as BlockCipherOptions | undefined) ?? {};
    }

    this.#cipher = c;
    this.#options = o;

    if(isBrowser()) {
      console.warn('[Block Cipher]: `BlockCipher` is not recommended for use in the browser environment');
    }
  }

  async #DoEncryption(data: any): Promise<BlockResult> {
    if(typeof data === 'object' && !isPlainObject(data)) {
      throw new Exception(`Cannot encrypt instance of ${data.constructor.name}`, 'Invalid data type');
    }

    const output = await this.#cipher.encrypt(data);
    const slicer = new Slicer(output.toString('base64'), this.#options.blockSize ?? 512);

    slicer.slice();
    const blocks: Block[] = [];

    for(const chunk of slicer.chunks) {
      blocks.push(Object.freeze({
        index: chunk.index,
        hash: chunk.hash,
        data: chunk.value,
      }));
    }

    return Object.freeze({
      blocks: Object.freeze(blocks),
      checksum: slicer.hash,
      timestamp: Date.now(),
    } satisfies BlockResult);
  }

  public encrypt(data: any): Promise<BlockResult> {
    return this.#DoEncryption(data);
  }

  async #DoDecryption<T>(input: Omit<BlockResult, 'timestamp'>): Promise<Decrypted<T> & { readonly originalChecksun: string }> {
    const blocks = input.blocks.map(block => ({
      index: block.index,
      hash: block.hash,
      value: block.data,
    }));

    const encrypted = Slicer.join(blocks, input.checksum);
    const output = await this.#cipher.decrypt<T>(XBuffer.fromString(encrypted, { encoding: 'base64' }).buffer);

    return Object.freeze({
      originalChecksun: input.checksum,
      payload: output.payload,
      signature: output.signature,
      timestamp: Date.now(),
    });
  }

  public decrypt<T = any>(input: Omit<BlockResult, 'timestamp'>): Promise<Decrypted<T> & { readonly originalChecksun: string }> {
    return this.#DoDecryption<T>(input);
  }

  public get cipher(): LegacyCipher {
    return this.#cipher;
  }

  public get key(): SymmetricKey {
    return this.#cipher.key;
  }

  public [Symbol.toStringTag]() {
    return '[object BlockCipher]';
  }
}

export default BlockCipher;
