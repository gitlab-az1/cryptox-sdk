import {
  pbkdf2,
} from './keyd';


describe('keyd', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('should derive a key', async () => {
    const password = 'password';
    const salt = 'salt';
    const iterations = 1000;
    const key = await pbkdf2(password, salt, 'sha256', iterations, 'buffer');

    expect(key).toBeTruthy();
    expect(key.byteLength).toBe(32);
  });
});
