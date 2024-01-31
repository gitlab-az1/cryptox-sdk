import { Vector2D } from './2d';
import { Vector3D } from './3d';
import { MultidimensionalVector } from './multidimensional';


export {
  Vector2D,
  Vector3D,
  MultidimensionalVector,
};



// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace vectors { /* eslint-disable @typescript-eslint/no-var-requires */
  export const Vector2D: typeof import('./2d').Vector2D = require('./2d').Vector2D;
  export const Vector3D: typeof import('./3d').Vector3D = require('./3d').Vector3D;
  export const MultidimensionalVector: typeof import('./multidimensional').MultidimensionalVector = require('./multidimensional').MultidimensionalVector;
} /* eslint-enable @typescript-eslint/no-var-requires */

export default vectors;
