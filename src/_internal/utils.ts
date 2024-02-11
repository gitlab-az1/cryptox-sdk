declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Process {
      type?: string;
    }
  }
}


export function isBrowser(): boolean {
  // Check if the current environment is Node.js
  if(typeof process !== 'undefined' && process?.versions?.node) return false;

  // Check if the current environment is a browser
  if(typeof window !== 'undefined'
    && typeof window === 'object' &&
    !!window.document) return true;

  // Check for other browser-like environments (e.g., Electron renderer process)
  if(typeof process !== 'undefined' && typeof process?.type === 'string' && process?.type === 'renderer') return true;

  // Add additional checks for specific browser-like environments if needed

  // Assume Node.js environment if not running in a browser-like environment
  return false;
}


export function fromUtf8ToArray(str: string): Uint8Array {
  if(!isBrowser() && typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(str, 'utf8'));
  
  const strUtf8 = unescape(encodeURIComponent(str));
  const arr = new Uint8Array(strUtf8.length);

  for(let i = 0; i < strUtf8.length; i++) {
    arr[i] = strUtf8.charCodeAt(i);
  }

  return arr;
}


export function wasmSupported(): boolean {
  try {
    if(typeof WebAssembly !== 'object' || typeof WebAssembly.instantiate !== 'function') return false;

    const module = new WebAssembly.Module(
      Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00) // eslint-disable-line comma-dangle
    );

    if(module instanceof WebAssembly.Module) return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
  } catch {
    return false;
  }
  
  return false;
}

export function toNodeValue(value: string | Uint8Array): Buffer | string {
  return typeof value === 'string' ? value : Buffer.from(value);
}

export function toWebCryptoAlgorithm(algorithm: 'sha1' | 'sha256' | 'sha512' | 'md5'): string {
  if(algorithm === 'md5') {
    throw new Error('MD5 is not supported in WebCrypto.');
  }

  return algorithm === 'sha1' ? 'SHA-1' : algorithm === 'sha256' ? 'SHA-256' : 'SHA-512';
}

export function toUint8Buffer(value: Buffer | string | Uint8Array): Uint8Array {
  let buf: Uint8Array;

  if(typeof value === 'string') {
    buf = fromUtf8ToArray(value);
  } else {
    buf = value;
  }
  
  return buf;
}

export function fromBufferToByteString(buffer: ArrayBuffer): string {
  let output: string = '';

  for(const byte of new Uint8Array(buffer)) {
    output += String.fromCharCode(byte);
  }

  return output;
}


export async function toByteString(value: string | Uint8Array): Promise<string> {
  const { util } = await import('node-forge');
  let bytes: string;

  if(typeof value === 'string') {
    bytes = util.encodeUtf8(value);
  } else {
    bytes = fromBufferToByteString(value);
  }
  
  return bytes;
}


export function fromByteStringToArray(str: string): Uint8Array {  
  const arr = new Uint8Array(str.length);

  for(let i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i);
  }

  return arr;
}
