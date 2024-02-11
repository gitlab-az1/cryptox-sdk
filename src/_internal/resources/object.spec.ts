import * as object from './object';


describe('core/common/object', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('should be able to omit properties from an object', () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3,
    } as const;

    const result = object.omit(obj, 'a', 'b');
    expect(result).toEqual({ c: 3 });

    expect(result).not.toHaveProperty('a');
    expect(result).not.toHaveProperty('b');
    expect(result).toHaveProperty('c');
    expect(result.c).toBe(3);
  });
});
