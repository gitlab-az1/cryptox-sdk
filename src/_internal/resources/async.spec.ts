import {
  delay,
} from './async';


describe('_internal/resources/async', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('should delay the execution of a function', async () => {
    const start = Date.now();
    await delay(250);
    const end = Date.now();

    expect(end - start).toBeGreaterThanOrEqual(250);
  });
});
