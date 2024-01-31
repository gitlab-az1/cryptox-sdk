import type{ MaybePromise } from 'typesdk/types';

import { MultidimensionalVector } from '../vectors';


export interface Embedding {
  embed(text: string): MaybePromise<MultidimensionalVector>;
}
