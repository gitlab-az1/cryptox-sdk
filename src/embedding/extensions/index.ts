export * from './postgresql';



// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace extensions { /* eslint-disable @typescript-eslint/no-var-requires */
  export const PostgresEmbeddingExtension: typeof import('./postgresql').PostgresEmbeddingExtension = require('./postgresql').PostgresEmbeddingExtension;
  export type PostgresEmbeddingExtensionOptions = import('./postgresql').PostgresEmbeddingExtensionOptions;
  export type PostgresEmbeddingTextWorkerOptions = import('./postgresql').PostgresEmbeddingTextWorkerOptions;
  export type DatabaseSchema = import('./postgresql').DatabaseSchema;
  export type LookupResults<S extends DatabaseSchema, K extends keyof S> = import('./postgresql').LookupResults<S, K>;
} /* eslint-enable @typescript-eslint/no-var-requires */


export default extensions;
