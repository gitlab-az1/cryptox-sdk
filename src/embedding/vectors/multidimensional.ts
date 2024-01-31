import math from 'typesdk/math';

import { Exception } from '../../errors/Exception';


export class MultidimensionalVector {
  readonly #dimensions: number;
  #values: number[];
  #isFrozen: boolean;

  constructor(...values: number[] | readonly number[]) {
    this.#values = [...values];
    this.#dimensions = values.length;
    this.#isFrozen = false;
  }

  public get dimensions(): number {
    return this.#dimensions;
  }

  public get isFrozen(): boolean {
    return this.#isFrozen;
  }

  public magnitude(): number {
    const sumOfSquares = this.#values.reduce((sum, value) => (sum + (value ** 2)), 0);
    return math.sqrt(sumOfSquares);
  }

  public normalize(): void {
    if(this.#isFrozen) {
      throw new Error('Cannot normalize a frozen vector');
    }

    const magnitude = this.magnitude();

    if(magnitude === 0) {
      throw new Exception('Cannot normalize a vector with magnitude 0', 'division by zero');
    }

    this.#values = this.#values.map(value => (value / magnitude));
  }

  public safeNormalize(): void {
    if(this.#isFrozen) {
      throw new Error('Cannot normalize a frozen vector');
    }

    const magnitude = this.magnitude();
    if(magnitude === 0) return;

    this.#values = this.#values.map(value => (value / magnitude));
  }

  public toSafeNormalized(): MultidimensionalVector | null {
    if(this.#isFrozen) {
      throw new Error('Cannot normalize a frozen vector');
    }

    const magnitude = this.magnitude();
    if(magnitude === 0) return null;

    const normalizedValues = this.#values.map(value => (value / magnitude));
    return new MultidimensionalVector(...normalizedValues);
  }

  public toNormalized(): MultidimensionalVector {
    if(this.#isFrozen) {
      throw new Error('Cannot normalize a frozen vector');
    }

    const magnitude = this.magnitude();

    if(magnitude === 0) {
      throw new Exception('Cannot normalize a vector with magnitude 0', 'division by zero');
    }

    const normalizedValues = this.#values.map(value => (value / magnitude));
    return new MultidimensionalVector(...normalizedValues);
  }

  public add(vec: MultidimensionalVector): void {
    if(this.#isFrozen) {
      throw new Error('Cannot add a vector to a frozen vector');
    }

    if(this.#dimensions !== vec.dimensions) {
      throw new Exception('Cannot add vectors with different dimensions', 'dimension mismatch');
    }

    this.#values = this.#values.map((value, index) => (value + vec.#values[index]));
  }

  public toAdded(vec: MultidimensionalVector): MultidimensionalVector {
    if(this.#isFrozen) {
      throw new Error('Cannot add a vector to a frozen vector');
    }

    if(this.#dimensions !== vec.dimensions) {
      throw new Exception('Cannot add vectors with different dimensions', 'dimension mismatch');
    }

    const values = this.#values.map((value, index) => (value + vec.#values[index]));
    return new MultidimensionalVector(...values);
  }

  public subtract(vec: MultidimensionalVector): void {
    if(this.#isFrozen) {
      throw new Error('Cannot subtract a vector from a frozen vector');
    }

    if(this.#dimensions !== vec.dimensions) {
      throw new Exception('Cannot subtract vectors with different dimensions', 'dimension mismatch');
    }

    this.#values = this.#values.map((value, index) => (value - vec.#values[index]));
  }

  public toSubtracted(vec: MultidimensionalVector): MultidimensionalVector {
    if(this.#isFrozen) {
      throw new Error('Cannot subtract a vector from a frozen vector');
    }
    
    if(this.#dimensions !== vec.dimensions) {
      throw new Exception('Cannot subtract vectors with different dimensions', 'dimension mismatch');
    }
    
    const values = this.#values.map((value, index) => (value - vec.#values[index]));
    return new MultidimensionalVector(...values);
  }

  public dot(vec: MultidimensionalVector): number {
    if(this.#dimensions !== vec.dimensions) {
      throw new Exception('Cannot dot vectors with different dimensions', 'dimension mismatch');
    }

    return this.#values.reduce((sum, value, index) => (sum + (value * vec.#values[index])), 0);
  }

  public cross(vec: MultidimensionalVector): void {
    if(this.#dimensions !== vec.dimensions) {
      throw new Exception('Cannot cross vectors with different dimensions', 'dimension mismatch');
    }

    if(this.#dimensions !== 3) {
      throw new Exception('Cannot cross vectors with dimensions other than 3', 'dimension mismatch');
    }

    const x = (this.#values[1] * vec.#values[2]) - (this.#values[2] * vec.#values[1]);
    const y = (this.#values[2] * vec.#values[0]) - (this.#values[0] * vec.#values[2]);
    const z = (this.#values[0] * vec.#values[1]) - (this.#values[1] * vec.#values[0]);

    this.#values = [x, y, z];
  }

  public toCrossed(vec: MultidimensionalVector): MultidimensionalVector {
    if(this.#dimensions !== vec.dimensions) {
      throw new Exception('Cannot cross vectors with different dimensions', 'dimension mismatch');
    }
    
    if(this.#dimensions !== 3) {
      throw new Exception('Cannot cross vectors with dimensions other than 3', 'dimension mismatch');
    }
    
    const x = (this.#values[1] * vec.#values[2]) - (this.#values[2] * vec.#values[1]);
    const y = (this.#values[2] * vec.#values[0]) - (this.#values[0] * vec.#values[2]);
    const z = (this.#values[0] * vec.#values[1]) - (this.#values[1] * vec.#values[0]);
    
    return new MultidimensionalVector(x, y, z);
  }

  public scale(scalar: number): void {
    if(this.#isFrozen) {
      throw new Error('Cannot scale a frozen vector');
    }

    this.#values = this.#values.map(value => (value * scalar));
  }

  public toScaled(scalar: number): MultidimensionalVector {
    if(this.#isFrozen) {
      throw new Error('Cannot scale a frozen vector');
    }

    const values = this.#values.map(value => (value * scalar));
    return new MultidimensionalVector(...values);
  }

  public freeze(): void {
    if(this.#isFrozen) {
      throw new Exception('Cannot freeze a frozen vector', 'already frozen');
    }

    this.#isFrozen = true;
  }

  public *[Symbol.iterator](): Generator<number> {
    for(const value of this.#values) {
      yield value;
    }
  }

  public toArray(): number[] {
    return [...this.#values];
  }
}

export default MultidimensionalVector;
