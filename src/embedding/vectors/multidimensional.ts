import math from 'typesdk/math';

import { Exception } from '../../errors/Exception';


/**
 * Represents a multidimensional vector.
 */
export class MultidimensionalVector {
  readonly #dimensions: number;
  #values: number[];
  #isFrozen: boolean;

  /**
   * Constructs a new MultidimensionalVector instance.
   * 
   * @param values The values of the vector.
   */
  constructor(...values: number[] | readonly number[]) {
    this.#values = [...values];
    this.#dimensions = values.length;
    this.#isFrozen = false;
  }

  /**
   * Gets the number of dimensions of the vector.
   */
  public get dimensions(): number {
    return this.#dimensions;
  }

  /**
   * Gets a value indicating whether the vector is frozen.
   */
  public get isFrozen(): boolean {
    return this.#isFrozen;
  }

  /**
   * Calculates the magnitude (length) of the vector.
   * 
   * @returns The magnitude of the vector.
   */
  public magnitude(): number {
    const sumOfSquares = this.#values.reduce((sum, value) => (sum + (value ** 2)), 0);
    return math.sqrt(sumOfSquares);
  }

  /**
   * Normalizes the vector.
   * 
   * @throws Error if the vector is frozen or has magnitude 0.
   */
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

  /**
   * Safely normalizes the vector.
   * Does nothing if the vector is frozen or has magnitude 0.
   */
  public safeNormalize(): void {
    if(this.#isFrozen) return;

    const magnitude = this.magnitude();
    if(magnitude === 0) return;

    this.#values = this.#values.map(value => (value / magnitude));
  }

  /**
   * Returns a new normalized vector or null if the original vector has magnitude 0.
   * 
   * Returns `null` if the vector is frozen.
   * 
   * @returns A new normalized vector, or null if the original vector has magnitude 0.
   */
  public toSafeNormalized(): MultidimensionalVector | null {
    if(this.#isFrozen) {
      throw new Error('Cannot normalize a frozen vector');
    }

    const magnitude = this.magnitude();
    if(magnitude === 0) return null;

    const normalizedValues = this.#values.map(value => (value / magnitude));
    return new MultidimensionalVector(...normalizedValues);
  }

  /**
   * Returns a new normalized vector.
   * 
   * @throws Error if the vector is frozen or has magnitude 0.
   * @returns A new normalized vector.
   */
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

  /**
   * Adds another vector to this vector.
   * 
   * @param vec The vector to add.
   * @throws Error if the vector is frozen or vectors have different dimensions.
   */
  public add(vec: MultidimensionalVector): void {
    if(this.#isFrozen) {
      throw new Error('Cannot add a vector to a frozen vector');
    }

    if(this.#dimensions !== vec.dimensions) {
      throw new Exception('Cannot add vectors with different dimensions', 'dimension mismatch');
    }

    this.#values = this.#values.map((value, index) => (value + vec.#values[index]));
  }

  /**
   * Returns a new vector resulting from adding another vector to this vector.
   * 
   * @param vec The vector to add.
   * @throws Error if the vector is frozen or vectors have different dimensions.
   * @returns A new vector resulting from the addition.
   */
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

  /**
   * Subtracts another vector from this vector.
   * 
   * @param vec The vector to subtract.
   * @throws Error if the vector is frozen or vectors have different dimensions.
   */
  public subtract(vec: MultidimensionalVector): void {
    if(this.#isFrozen) {
      throw new Error('Cannot subtract a vector from a frozen vector');
    }

    if(this.#dimensions !== vec.dimensions) {
      throw new Exception('Cannot subtract vectors with different dimensions', 'dimension mismatch');
    }

    this.#values = this.#values.map((value, index) => (value - vec.#values[index]));
  }

  /**
   * Returns a new vector resulting from subtracting another vector from this vector.
   * 
   * @param vec The vector to subtract.
   * @throws Error if the vector is frozen or vectors have different dimensions.
   * @returns A new vector resulting from the subtraction.
   */
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

  /**
   * Computes the dot product with another vector.
   * 
   * @param vec The vector to compute the dot product with.
   * @throws Error if vectors have different dimensions.
   * @returns The dot product of the two vectors.
   */
  public dot(vec: MultidimensionalVector): number {
    if(this.#dimensions !== vec.dimensions) {
      throw new Exception('Cannot dot vectors with different dimensions', 'dimension mismatch');
    }

    return this.#values.reduce((sum, value, index) => (sum + (value * vec.#values[index])), 0);
  }

  /**
   * Computes the cross product with another vector.
   * 
   * @param vec The vector to compute the cross product with.
   * @throws Error if vectors have different dimensions or dimensions other than 3.
   */
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

  /**
   * Returns a new vector resulting from the cross product with another vector.
   * 
   * @param vec The vector to compute the cross product with.
   * @throws Error if vectors have different dimensions or dimensions other than 3.
   * @returns A new vector resulting from the cross product.
   */
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

  /**
   * Scales the vector by a scalar value.
   * 
   * @param scalar The scalar value to scale the vector by.
   * @throws Error if the vector is frozen.
   */
  public scale(scalar: number): void {
    if(this.#isFrozen) {
      throw new Error('Cannot scale a frozen vector');
    }

    this.#values = this.#values.map(value => (value * scalar));
  }

  /**
   * Returns a new vector resulting from scaling the vector by a scalar value.
   * 
   * @param scalar The scalar value to scale the vector by.
   * @throws Error if the vector is frozen.
   * @returns A new vector resulting from the scaling.
   */
  public toScaled(scalar: number): MultidimensionalVector {
    if(this.#isFrozen) {
      throw new Error('Cannot scale a frozen vector');
    }

    const values = this.#values.map(value => (value * scalar));
    return new MultidimensionalVector(...values);
  }

  /**
   * Freezes the vector, preventing further modification.
   * 
   * @throws Error if the vector is already frozen.
   */
  public freeze(): void {
    if(this.#isFrozen) {
      throw new Exception('Cannot freeze a frozen vector', 'already frozen');
    }

    this.#isFrozen = true;
  }

  /**
   * Allows iterating over the values of the vector.
   * 
   * @returns An iterator for the values of the vector.
   */
  public *[Symbol.iterator](): Generator<number> {
    for(const value of this.#values) {
      yield value;
    }
  }

  /**
   * Converts the vector to an array.
   * 
   * @returns An array representation of the vector.
   */
  public toArray(): number[] {
    return [...this.#values];
  }
}

export default MultidimensionalVector;
