import crypto from 'node:crypto';
import { LayeredEncryption, Crypto } from 'typesdk/crypto';

import Slicer from '../resources/Slicer';
import { type KnownSymmetricAlgorithm } from './core';




export type BlockCipherOptions = {
  algorithm: KnownSymmetricAlgorithm | {
    name: string;
    length?: number;
  };
  chunkSize: number;
  iterations?: number;
  layers?: number;
}


export type BlockCipherResultAsBuffer = {
  readonly blocks: ({
    readonly signature: Buffer;
    readonly data: Buffer;
    readonly encoding: 'raw';
  })[];
  readonly contentSha512: Buffer;
  readonly contentSignature: Buffer;
  readonly timestamp: number;
  readonly keyDerivationIterations: number;
  readonly keyDerivationAlgorithm: string;
  readonly merkleRoot: readonly Buffer[];
}

export type BlockCipherResultAsString = {
  readonly blocks: ({
    readonly signature: string;
    readonly data: string;
    readonly encoding: BufferEncoding;
  })[];
  readonly contentSha512: string;
  readonly contentSignature: string;
  readonly timestamp: number;
  readonly keyDerivationIterations?: number;
  readonly keyDerivationAlgorithm?: string;
  readonly merkleRoot: readonly string[];
}

const DEFAULT_OPTIONS: BlockCipherOptions = {
  algorithm: 'aes-256-cbc-hmac-sha512',
  chunkSize: 512,
  layers: 1,
};

export class BlockCipher {
  readonly #key: Buffer;
  readonly #salt: string;
  readonly #options: BlockCipherOptions;

  constructor(key: Buffer | Uint8Array | string, salt: Buffer | Uint8Array | string, options?: BlockCipherOptions) {
    this.#options = Object.assign({}, DEFAULT_OPTIONS, options);

    if(!Buffer.isBuffer(key)) {
      key = Buffer.from(key);
    }

    this.#key = key as Buffer;

    if(!Buffer.isBuffer(salt)) {
      salt = Buffer.from(salt);
    }

    this.#salt = (salt as Buffer).toString('hex');
  }

  public encrypt(data: string): Promise<BlockCipherResultAsBuffer>;
  public encrypt(data: string, encoding: BufferEncoding): Promise<BlockCipherResultAsString>;
  public encrypt(data: Buffer | Uint8Array): Promise<BlockCipherResultAsBuffer>;
  public encrypt(data: Buffer | Uint8Array, encoding: BufferEncoding): Promise<BlockCipherResultAsString>;
  public encrypt(data: Buffer | string | Uint8Array, encoding?: BufferEncoding): Promise<BlockCipherResultAsBuffer | BlockCipherResultAsString> {
    if(typeof this.#options.layers === 'number' &&
      this.#options.layers > 1) return this.#encryptWithLayers(data, encoding);
  }

  async #encryptWithLayers(data: Buffer | string | Uint8Array, encoding?: BufferEncoding): Promise<BlockCipherResultAsBuffer | BlockCipherResultAsString> {
    const alg = typeof this.#options.algorithm === 'object' ? this.#options.algorithm.name : this.#options.algorithm;

    if(!Buffer.isBuffer(data)) {
      data = Buffer.from(data);
    }

    if(alg.toLowerCase().indexOf('aes') < 0) {
      throw new TypeError('Only AES-based algorithms are supported for layered encryption yet.');
    }

    const enc = new LayeredEncryption({
      key: this.#key,
      layers: this.#options.layers,
      algorithm: 'aes-256-cbc',
    });

    const hmac = await Crypto.hmac512(data.toString('utf-8'), this.#salt);
    const sha512 = crypto.createHash('sha512')
      .update(data)
      .digest('hex');

    const encrypted = await enc.encrypt(data);
    const encryptedSlicer = new Slicer(encrypted, this.#options.chunkSize);
    encryptedSlicer.slice();

    const blocks = [] as any[];

    for(const chunk of encryptedSlicer.chunks) {
      // eslint-disable-next-line no-extra-boolean-cast
      const data = !!encoding ? chunk.value : Buffer.from(chunk.value);

      blocks.push({
        signature: chunk.hash,
        data,
        encoding,
      });
    }

    if(!encoding) return {
      blocks,
      contentSha512: Buffer.from(sha512, 'hex'),
      contentSignature: Buffer.from(hmac, 'hex'),
      timestamp: Date.now(),
      keyDerivationIterations: this.#options.iterations,
      keyDerivationAlgorithm: 'pbkdf2',
      merkleRoot: encryptedSlicer.createMerkleTree(),
    };
  }
}

export default BlockCipher;
