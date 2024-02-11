import Buffer from './buffer';


describe('_internal/resources/buffer', () => {
  test('it should be ok', () => {
    expect(25 ** (1/2)).toBe(5);
  });

  test('should allocate a buffer', () => {
    const buffer = Buffer.alloc(10);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBe(10);
  });

  test('should fill a buffer with character `0x2d`', () => {
    const buffer = Buffer.alloc(10);
    buffer.fill(0x2d);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBe(10);
    expect(buffer.buffer[0]).toBe(0x2d);
    expect(buffer.buffer[9]).toBe(0x2d);

    let utf8 = '';

    for(let i = 0; i < buffer.length; i++) {
      utf8 += String.fromCharCode(buffer.buffer[i]);
    }

    expect(utf8).toBe('----------');
  });

  test('should fill a buffer with character `0x2d` and offset 2', () => {
    const buffer = Buffer.alloc(10);
    buffer.fill(0x0);
    buffer.fill(0x2d, 2);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBe(10);
    expect(buffer.buffer[0]).toBe(0x0);
    expect(buffer.buffer[1]).toBe(0x0);
    expect(buffer.buffer[2]).toBe(0x2d);
    expect(buffer.buffer[9]).toBe(0x2d);

    let utf8 = '';

    for(let i = 0; i < buffer.length; i++) {
      utf8 += String.fromCharCode(buffer.buffer[i]);
    }

    expect(utf8).toBe(String.fromCharCode(0x0).repeat(2) + '--------');
  });

  test('should set a new byte value at index 2', () => {
    const buffer = Buffer.alloc(10);
    buffer.fill(0x0);
    buffer.set(Buffer.fromByteArray([0x2d]), 2);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBe(10);
    expect(buffer.buffer[0]).toBe(0x0);
    expect(buffer.buffer[1]).toBe(0x0);
    expect(buffer.buffer[2]).toBe(0x2d);
    expect(buffer.buffer[9]).toBe(0x0);
  });

  test('should get the binary index of an subarray', () => {
    const buffer = Buffer.alloc(10);
    
    buffer.buffer[0x0] = 0x1f;
    buffer.buffer[0x1] = 0xd;
    buffer.buffer[0x2] = 0x2d;
    buffer.buffer[0x3] = 0xca;
    buffer.buffer[0x4] = 0x3;
    buffer.buffer[0x5] = 0xa1;
    buffer.buffer[0x6] = 0xb8;
    buffer.buffer[0x7] = 0x0;
    buffer.buffer[0x8] = 0xff;
    buffer.buffer[0x9] = 0xaf;

    const subarray = Buffer.fromByteArray([0x2d, 0xca, 0x3, 0xa1, 0xb8]);
    expect(buffer.indexOf(subarray)).toBe(2);
  });

  test('should get the binary index of an subarray with offset', () => {
    const buffer = Buffer.alloc(10);
        
    buffer.buffer[0x0] = 0x1f;
    buffer.buffer[0x1] = 0xd;
    buffer.buffer[0x2] = 0x2d;
    buffer.buffer[0x3] = 0xca;
    buffer.buffer[0x4] = 0x3;
    buffer.buffer[0x5] = 0xa1;
    buffer.buffer[0x6] = 0xb8;
    buffer.buffer[0x7] = 0x0;
    buffer.buffer[0x8] = 0xff;
    buffer.buffer[0x9] = 0xaf;
    
    const subarray = Buffer.fromByteArray([0x2d, 0xca, 0x3, 0xa1, 0xb8]);
    expect(buffer.indexOf(subarray, 3)).toBe(-1);
  });

  test('should convert a buffer to a string', () => {
    const word = 'hello world';
    const buffer = Buffer.alloc(word.length);

    for(let i = 0; i < word.length; i++) {
      buffer.buffer[i] = word.charCodeAt(i);
    }

    expect(buffer.toString()).toBe(word);
  });

  test('should convert a buffer to a string with hex encoding', () => {
    const word = 'hello world';
    const buffer = Buffer.alloc(word.length);

    for(let i = 0; i < word.length; i++) {
      buffer.buffer[i] = word.charCodeAt(i);
    }

    expect(buffer.toString('hex')).toBe('68656c6c6f20776f726c64');
  });

  test('should convert a buffer to a string with base64 encoding', () => {
    const word = 'hello world';
    const buffer = Buffer.alloc(word.length);
    
    for(let i = 0; i < word.length; i++) {
      buffer.buffer[i] = word.charCodeAt(i);
    }
    
    expect(buffer.toString('base64')).toBe('aGVsbG8gd29ybGQ=');
  });

  test('should convert a buffer to a string with base64url encoding', () => {
    const word = 'hello world';
    const buffer = Buffer.alloc(word.length);
    
    for(let i = 0; i < word.length; i++) {
      buffer.buffer[i] = word.charCodeAt(i);
    }
    
    expect(buffer.toString('base64url')).toBe('aGVsbG8gd29ybGQ');
  });

  test('should convert a buffer to a string with binary-tail encoding', () => {
    const word = 'hello world';
    const buffer = Buffer.alloc(word.length);
    
    for(let i = 0; i < word.length; i++) {
      buffer.buffer[i] = word.charCodeAt(i);
    }
    
    expect(buffer.toString('binary-tail')).toBe('0110100001100101011011000110110001101111001000000111011101101111011100100110110001100100');
  });

  test('should read a binary tail', () => {
    const tail = '0110100001100101011011000110110001101111001000000111011101101111011100100110110001100100';
    const buffer = Buffer.fromBinaryTail(tail);

    expect(buffer.buffer[0]).toBe(0x68);
    expect(buffer.buffer[1]).toBe(0x65);
    expect(buffer.buffer[2]).toBe(0x6c);
    expect(buffer.buffer[3]).toBe(0x6c);
    expect(buffer.buffer[4]).toBe(0x6f);
    expect(buffer.buffer[5]).toBe(0x20);
    expect(buffer.buffer[6]).toBe(0x77);
    expect(buffer.buffer[7]).toBe(0x6f);
    
    expect(buffer.toString('utf-8')).toBe('hello world');
  });

  test('should be able to write a unsigned 32 bits integer', () => {
    const buffer = Buffer.alloc(4);

    buffer.writeUInt32LE(0xdeadbeef, 0);
    expect(buffer.buffer[0]).toBe(0xef);
    expect(buffer.buffer[1]).toBe(0xbe);
    expect(buffer.buffer[2]).toBe(0xad);
    expect(buffer.buffer[3]).toBe(0xde);
  });

  test('should create a buffer from byte array', () => {
    const buffer = Buffer.fromByteArray([0x1f, 0xd, 0x2d, 0xca, 0x3, 0xa1, 0xb8, 0x0, 0xff, 0xaf]);

    expect(buffer.buffer[0x0]).toBe(0x1f);
    expect(buffer.buffer[0x1]).toBe(0xd);
    expect(buffer.buffer[0x2]).toBe(0x2d);
    expect(buffer.buffer[0x3]).toBe(0xca);
    expect(buffer.buffer[0x4]).toBe(0x3);
    expect(buffer.buffer[0x5]).toBe(0xa1);
    expect(buffer.buffer[0x6]).toBe(0xb8);
    expect(buffer.buffer[0x7]).toBe(0x0);
    expect(buffer.buffer[0x8]).toBe(0xff);
    expect(buffer.buffer[0x9]).toBe(0xaf);
  });

  test('should create a buffer from NodeJS built-in Buffer', () => {
    const buffer = Buffer.fromNodeBuffer(globalThis.Buffer.from([0x1f, 0xd, 0x2d, 0xca, 0x3, 0xa1, 0xb8, 0x0, 0xff, 0xaf]));

    expect(buffer.buffer[0x0]).toBe(0x1f);
    expect(buffer.buffer[0x1]).toBe(0xd);
    expect(buffer.buffer[0x2]).toBe(0x2d);
    expect(buffer.buffer[0x3]).toBe(0xca);
    expect(buffer.buffer[0x4]).toBe(0x3);
    expect(buffer.buffer[0x5]).toBe(0xa1);
    expect(buffer.buffer[0x6]).toBe(0xb8);
    expect(buffer.buffer[0x7]).toBe(0x0);
    expect(buffer.buffer[0x8]).toBe(0xff);
    expect(buffer.buffer[0x9]).toBe(0xaf);
  });

  test('should create a buffer from Uint8Array', () => {
    const buffer = Buffer.fromUint8Array(new Uint8Array([0x1f, 0xd, 0x2d, 0xca, 0x3, 0xa1, 0xb8, 0x0, 0xff, 0xaf]));

    expect(buffer.buffer[0x0]).toBe(0x1f);
    expect(buffer.buffer[0x1]).toBe(0xd);
    expect(buffer.buffer[0x2]).toBe(0x2d);
    expect(buffer.buffer[0x3]).toBe(0xca);
    expect(buffer.buffer[0x4]).toBe(0x3);
    expect(buffer.buffer[0x5]).toBe(0xa1);
    expect(buffer.buffer[0x6]).toBe(0xb8);
    expect(buffer.buffer[0x7]).toBe(0x0);
    expect(buffer.buffer[0x8]).toBe(0xff);
    expect(buffer.buffer[0x9]).toBe(0xaf);
  });
});
