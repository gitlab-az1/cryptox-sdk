export * from './errors';
export * from './embedding';



// eslint-disable-next-line @typescript-eslint/no-namespace
namespace cryptox { /* eslint-disable @typescript-eslint/no-var-requires */
  export const embedding: typeof import('./embedding').embedding = require('./embedding').embedding;
  export const errors: typeof import('./errors').errors = require('./errors').errors;
  export type PostgresEmbeddingExtensionOptions = import('./embedding/extensions/postgresql').PostgresEmbeddingExtensionOptions;
  export type PostgresEmbeddingTextWorkerOptions = import('./embedding/extensions/postgresql').PostgresEmbeddingTextWorkerOptions;
  export type DatabaseSchema = import('./embedding/extensions/postgresql').DatabaseSchema; 
  export type LookupResults<S extends DatabaseSchema, K extends keyof S> = import('./embedding/extensions/postgresql').LookupResults<S, K>;
} /* eslint-enable @typescript-eslint/no-var-requires */

export default cryptox;
