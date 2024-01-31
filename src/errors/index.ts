export * from './Exception';
export * from './CanceledError';
export * from './ValidationError';
export * from './InvalidSignatureError';



// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace errors { /* eslint-disable @typescript-eslint/no-var-requires */
  export const Exception: typeof import('./Exception').Exception = require('./Exception').Exception;
  export const CanceledError: typeof import('./CanceledError').CanceledError = require('./CanceledError').CanceledError;
  export const ValidationError: typeof import('./ValidationError').ValidationError = require('./ValidationError').ValidationError;
  export const InvalidSignatureError: typeof import('./InvalidSignatureError').InvalidSignatureError = require('./InvalidSignatureError').InvalidSignatureError;
} /* eslint-enable @typescript-eslint/no-var-requires */

export default errors;
