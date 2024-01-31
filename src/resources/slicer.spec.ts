import Slicer from './Slicer';


describe('Lib::Slicer', () => {
  test('should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('should slice a string', () => {
    const slicer = new Slicer('hello world', 5);
    slicer.slice();

    expect(slicer.chunks).toBeInstanceOf(Array);
    expect(slicer.chunks.map(item => item.value)).toEqual(['hello', ' worl', 'd']);
    expect(slicer.chunks.length).toBe(3);
    expect(slicer.chunkSize).toBe(5);
  });

  test('should join the chunks', () => {
    const slicer = new Slicer('hello world', 5);
    slicer.slice();

    expect(Slicer.join(slicer.chunks)).toBe('hello world');
  });
});