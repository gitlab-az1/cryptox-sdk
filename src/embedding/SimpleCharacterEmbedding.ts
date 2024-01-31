import math from 'typesdk/math';


export type SimpleEmbeddingOptions = {
  embeddingSize?: number;
  learningRate?: number;
  epochs?: number;
}

export class SimpleCharacterEmbedding {
  private _embeddingSize: number;
  private _learningRate: number;
  private _epochs: number;
  private _characters: Set<string>;
  private _charToIndex: Map<string, number>;
  private _indexToChar: Map<number, string>;
  private _vocabSize: number;
  private _w: number[][];
  private _c: number[][];

  constructor(sentences: string[] | readonly string[], embeddingSize = 3, learningRate = 0.01, epochs = 100) {
    this._embeddingSize = embeddingSize;
    this._learningRate = learningRate;
    this._epochs = epochs;
    this._characters = new Set();
    this._charToIndex = new Map();
    this._indexToChar = new Map();
    this._vocabSize = 0;
    this._w = [];
    this._c = [];

    this._init(sentences);

    for(let i = 0; i < sentences.length; i++) {
      this._train(sentences[i]);
    }
  }

  public get embeddingSize(): number {
    return this._embeddingSize;
  }

  public get learningRate(): number {
    return this._learningRate;
  }

  public get epochs(): number {
    return this._epochs;
  }

  public get vocabSize(): number {
    return this._vocabSize;
  }

  public get charToIndex(): Map<string, number> {
    return this._charToIndex;
  }

  public get indexToChar(): Map<number, string> {
    return this._indexToChar;
  }

  private _init(sentences: string[] | readonly string[]): void {
    for(const sentence of sentences) {
      for(const char of sentence) {
        if(this._characters.has(char)) continue;

        const index = this._vocabSize;
        this._charToIndex.set(char, index);
        this._indexToChar.set(index, char);
        this._characters.add(char);
        this._w[index] = Array.from({ length: this._embeddingSize }, () => math.random.random);
        this._c[index] = Array.from({ length: this._embeddingSize }, () => math.random.random);
        this._vocabSize++;
      }
    }
  }

  private _train(sentence: string) {
    for(let epoch = 0; epoch < this._epochs; epoch++) {
      const chars = sentence.toLowerCase().split('');

      for(let i = 0; i < chars.length; i++) {
        const targetChar = chars[i];
        const targetIndex = this._charToIndex.get(targetChar)!;
        const contextChars = chars.slice(math.max(0, i - 2), math.min(chars.length, i + 3)).filter((_, j) => j !== i);

        for(const contextChar of contextChars) {
          const contextIndex = this._charToIndex.get(contextChar)!;

          for(let k = 0; k < this._embeddingSize; k++) {
            this._w[targetIndex][k] -= this._learningRate * this._c[contextIndex][k];
            this._c[contextIndex][k] -= this._learningRate * this._w[targetIndex][k];
          }
        }
      }
    }
  }

  public  getCharVector(char: string): number[] {
    const index = this._charToIndex.get(char);
    if(!index) return [];

    return this._w[index];
  }
}

export default SimpleCharacterEmbedding;
