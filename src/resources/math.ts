import math from 'typesdk/math';

import { MultidimensionalVector } from '../embedding/vectors';


/**
 * Calculates the cosine similarity between two multidimensional vectors.
 *
 * @warning
 * Before use this method, ensure that both vectors have the same length
 * because the dot product will be calculated internally in the `MultidimensionalVector` class
 * and it will throw an error if the vectors have different lengths.
 *  
 * 
 * @param {MultidimensionalVector} a The vector to compare.
 * @param {MultidimensionalVector} b The vector to compare with.
 * @returns {number} The cosine similarity between the two vectors.
 */
export function calculateCosineSimilarityForMultidimensionalVectorInstances(a: MultidimensionalVector, b: MultidimensionalVector): number {
  if(!(a instanceof MultidimensionalVector)) {
    throw new TypeError(`Expected argument $0 to be an instance of MultidimensionalVector, but got ${typeof a}`);
  }

  if(!(b instanceof MultidimensionalVector)) {
    throw new TypeError(`Expected argument $1 to be an instance of MultidimensionalVector, but got ${typeof b}`);
  }

  const dot = a.dot(b);
  const magA = a.magnitude();
  const magB = b.magnitude();

  if(magA === 0 ||
      magB === 0) return 0;

  return dot / (magA * magB);
}


/**
 * Calculates the cosine similarity between two numeric arrays.
 * 
 * @param {number[]} a The array to compare.
 * @param {number[]} b The array to compare with.
 * @returns {number} The cosine similarity between the two arrays.
 */
export function calculateCosineSimilarityFromNumericArrays(a: number[] | readonly number[], b: number[] | readonly number[]): number {
  if(!Array.isArray(a)) {
    throw new TypeError(`Expected argument $0 to be an array, but got ${typeof a}`);
  }

  if(!a.every(x => typeof x === 'number')) {
    throw new TypeError(`Expected argument $0 to be an array of numbers, but got an array of ${a.map(x => typeof x).join(', ')}`);
  }

  if(!Array.isArray(b)) {
    throw new TypeError(`Expected argument $1 to be an array, but got ${typeof b}`);
  }

  if(!b.every(x => typeof x === 'number')) {
    throw new TypeError(`Expected argument $1 to be an array of numbers, but got an array of ${b.map(x => typeof x).join(', ')}`);
  }


  // Ensure both vectors have the same length by padding with zeros if needed
  const maxLength = math.max(a.length, b.length);
  const paddedVector1 = [...a, ...Array(maxLength - a.length).fill(0)] as number[];
  const paddedVector2 = [...b, ...Array(maxLength - b.length).fill(0)] as number[];

  // Calculate dot product
  const dotProduct = paddedVector1.reduce((acc, value, index) => (acc + (value * paddedVector2[index])), 0);

  // Calculate magnitude of each vector
  const magnitude1 = math.sqrt(paddedVector1.reduce((acc, value) => (acc + (value ** 2)), 0));
  const magnitude2 = math.sqrt(paddedVector2.reduce((acc, value) => (acc + (value ** 2)), 0));

  // Avoid division by zero
  if(magnitude1 === 0 ||
    magnitude2 === 0) return 0;

  // Calculate cosine similarity
  return dotProduct / (magnitude1 * magnitude2);
}
