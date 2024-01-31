import LegacyWordEmbedding from './LegacyWordEmbedding';
import { MultidimensionalVector } from './vectors';


describe('embedding/LegacyWordEmbedding', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('should embed text', () => {
    const embedding = new LegacyWordEmbedding();
    const vector = embedding.embed('hello world');

    expect(vector).toBeDefined();
    expect(vector.toArray().length).toBe(10);
  });

  test('should return a multidimensional vector for a sentence', () => {
    const embedding = new LegacyWordEmbedding();
    const vector = embedding.embed('hello world');

    expect(vector).toBeDefined();
    expect(vector).toBeInstanceOf(MultidimensionalVector);
  });

  test('should return a multidimensional vector for a word', () => {
    const embedding = new LegacyWordEmbedding();
    const vector = embedding.embed('hello');
    
    expect(vector).toBeDefined();
    expect(vector).toBeInstanceOf(MultidimensionalVector);
  });

  test('should encode a text with options', () => {
    const embedding = new LegacyWordEmbedding({
      caseSensitive: false,
      inputToVectorEncoding: 'crc32',
    });

    const vector = embedding.embed('hello world');

    expect(vector).toBeDefined();
    expect(vector.toArray().length).toBe(10);
  });
});
