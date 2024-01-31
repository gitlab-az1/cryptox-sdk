export * from './vectors';
export * from './LegacyWordEmbedding';
export * from './SimpleCharacterEmbedding';



// eslint-disable-next-line @typescript-eslint/no-namespace
namespace embedding { /* eslint-disable @typescript-eslint/no-var-requires */
  export const LegacyWordEmbedding: typeof import('./LegacyWordEmbedding').LegacyWordEmbedding = require('./LegacyWordEmbedding').LegacyWordEmbedding;
  export const vectors: typeof import('./vectors').vectors = require('./vectors').vectors;
} /* eslint-enable @typescript-eslint/no-var-requires */


export default embedding;
