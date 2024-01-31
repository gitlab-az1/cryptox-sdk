export type KnownSymmetricAlgorithm = 
  | 'aes-256-cbc'
  | 'aes-256-cbc-hmac-sha512'
  | 'chacha20-poly1305';


export interface Decrypted<T> {
  readonly payload: T;
  readonly signature: string;
  readonly timestamp: number;
}

export interface Cipher {
  encrypt(data: string): Promise<Buffer>;
  encrypt(data: string, encoding: BufferEncoding): Promise<string>;
  encrypt(data: Uint8Array): Promise<Buffer>;
  encrypt(data: Uint8Array, encoding: BufferEncoding): Promise<string>;

  decrypt<T>(data: string): Promise<Decrypted<T>>;
  decrypt<T>(data: Uint8Array): Promise<Decrypted<T>>;
}
