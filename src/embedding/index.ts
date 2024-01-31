export * from './vectors';
export * from './extensions';
export * from './LegacyWordEmbedding';
export * from './SimpleCharacterEmbedding';



// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace embedding { /* eslint-disable @typescript-eslint/no-var-requires */
  export const LegacyWordEmbedding: typeof import('./LegacyWordEmbedding').LegacyWordEmbedding = require('./LegacyWordEmbedding').LegacyWordEmbedding;
  export const vectors: typeof import('./vectors').vectors = require('./vectors').vectors;
  export const extensions: typeof import('./extensions').extensions = require('./extensions').extensions;
  export type LegacyWordEmbeddingOptions = import('./LegacyWordEmbedding').LegacyWordEmbeddingOptions;
  export type SimpleEmbeddingOptions = import('./SimpleCharacterEmbedding').SimpleEmbeddingOptions;
} /* eslint-enable @typescript-eslint/no-var-requires */


export default embedding;
