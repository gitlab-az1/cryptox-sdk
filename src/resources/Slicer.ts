import math from 'typesdk/math';
import { Hash } from 'typesdk/crypto';
import { Exception } from 'typesdk/errors';

import ValidationError from '../errors/ValidationError';
import InvalidSignatureError from '../errors/InvalidSignatureError';


export type Chunk = {
  readonly index: number;
  readonly value: string;
  readonly hash: string;
}

export class Slicer {
  readonly #originalSHA512: string;
  readonly #chunkSize: number;
  readonly #original: string;
  #chunks: Chunk[];

  public static join(chunks: Chunk[], originalChecksum?: string): string {
    const parts: string[] = [];
    const max = math.max(...[...chunks].map(chunk => chunk.index));

    for(let i = 0; i <= max; i++) {
      const chunk = chunks.find(chunk => chunk.index === i);
      if(!chunk) continue;

      const hash = Hash.sha512(chunk.value);

      if(hash !== chunk.hash) {
        throw new InvalidSignatureError('Failed to verify the integrity of the chunk.', chunk.hash, hash);
      }

      parts.push(chunk.value);
    }

    const original = parts.join('');
    if(!originalChecksum) return original;

    const originalHash = Hash.sha512(original);

    if(originalHash !== originalChecksum) {
      throw new InvalidSignatureError('Failed to verify the integrity of the original string.', originalChecksum, originalHash);
    }

    return original;
  }

  constructor(value: string, chunkSize: number = 96) {
    if(typeof value !== 'string') {
      throw new ValidationError('You can only slice strings.');
    }

    if(typeof chunkSize !== 'number') {
      throw new ValidationError('Chunk size must be a number.');
    }

    if(chunkSize < 2) {
      throw new ValidationError('Chunk size must be at least 2.');
    }

    this.#originalSHA512 = Hash.sha512(value);
    this.#chunkSize = chunkSize;
    this.#original = value;
    this.#chunks = [];
  }

  public slice(): void {
    for(let i = 0; i < this.#original.length; i += this.#chunkSize) {
      const chunk = this.#original.slice(i, i + this.#chunkSize);
      const hash = Hash.sha512(chunk);

      this.#chunks.push({
        index: i,
        value: chunk,
        hash,
      });
    }
  }

  public createMerkleTree(): string[] {
    if(this.#chunks.length < 1) {
      throw new Exception('You must slice the string first.');
    }

    const hashes = this.#chunks.map((chunk) => Hash.sha512(chunk.value));

    while(hashes.length > 1) {
      const levelHashes: string[] = [];
  
      for(let i = 0; i < hashes.length; i += 2) {
        const leftHash = hashes[i];
        const rightHash = i + 1 < hashes.length ? hashes[i + 1] : '';
  
        const combinedHash = Hash.sha512(leftHash + rightHash);
        levelHashes.push(combinedHash);
      }
  
      hashes.length = 0; // Clear the current hashes
      hashes.push(...levelHashes);
    }

    return hashes;
  }

  public get hash(): string {
    return this.#originalSHA512;
  }

  public get chunks(): Chunk[] {
    return [ ...this.#chunks ];
  }

  public get chunkSize(): number {
    return this.#chunkSize;
  }
}

export default Slicer;
