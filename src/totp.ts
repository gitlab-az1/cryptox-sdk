import math from 'typesdk/math';

import { base32Decode, hmacSHA1, intToByteArray, intToBytes } from './core';


/**
 * TOTP32 class for generating and validating Time-based One-Time Passwords (TOTP) using the SHA1 algorithm.
 */
export class TOTP32 {
  static #generateCode(secret: string, window: number = 30, timeOffset: number = 0): string {
    const timeStamp = math.floor(Date.now() / 1000) + timeOffset;
    const timeCounter = math.floor(timeStamp / window);

    const decodedSecret = base32Decode(secret);
    const hmacDigest = hmacSHA1(decodedSecret, intToByteArray(timeCounter));

    const offset = hmacDigest[hmacDigest.length - 1] & 0xf;
    
    const truncatedHash = ((hmacDigest[offset] & 0x7f) << 24) |
                          ((hmacDigest[offset + 1] & 0xff) << 16) |
                          ((hmacDigest[offset + 2] & 0xff) << 8) |
                          (hmacDigest[offset + 3] & 0xff);

    const otp = truncatedHash % Math.pow(10, 6);
    return otp.toString().padStart(6, '0');
  }

  static #validateCode(otp: string, secret: string, windowSize: number = 30, timeOffset: number = 0): boolean {
    return (otp === (this.#generateCode(secret, windowSize, timeOffset)));
  }

  /**
   * Generates a TOTP code.
   * 
   * @param secret The secret key used for generating the TOTP.
   * @param window The time window in seconds (default is 30 seconds).
   * @param timeOffset The time offset in seconds (default is 0).
   * @returns The generated TOTP code.
   */
  public static generate(secret: string, window: number = 30, timeOffset: number = 0): string {
    return this.#generateCode(secret, window, timeOffset);
  }

  /**
   * Validates a TOTP code.
   * 
   * @param otp The TOTP code to validate.
   * @param secret The secret key used for generating the TOTP.
   * @param windowSize The time window in seconds (default is 30 seconds).
   * @param timeOffset The time offset in seconds (default is 0).
   * @returns A boolean indicating whether the TOTP code is valid.
   */
  public static validate(otp: string, secret: string, windowSize: number = 30, timeOffset: number = 0): boolean {
    return this.#validateCode(otp, secret, windowSize, timeOffset);
  }
}


/**
 * TOTP64 class for generating and validating Time-based One-Time Passwords (TOTP) using the SHA1 algorithm with base64 encoding.
 */
export class TOTP64 {
  #crypt: typeof import('crypto');

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    this.#crypt = require('crypto');
  }

  #generateCode(secret: string, window: number = 30, timeOffset: number = 0): string {
    const timeStamp = math.floor(Date.now() / 1000) + timeOffset;
    const timeCounter = math.floor(timeStamp / window);

    const hmac = this.#crypt.createHmac('sha1', Buffer.from(secret, 'base64'));
    const hmacDigest = hmac.update(Buffer.from(intToBytes(timeCounter))).digest();

    const offset = hmacDigest[hmacDigest.length - 1] & 0xf;
    const truncatedHash = hmacDigest.readUInt32BE(offset) & 0x7fffffff;

    const otp = truncatedHash % math.pow(10, 6);
    return otp.toString().padStart(6, '0');
  }

  #validateCode(otp: string, secret: string, windowSize: number = 30, timeOffset: number = 0): boolean {
    return (otp === (this.#generateCode(secret, windowSize, timeOffset)));
  }

  /**
   * Generates a TOTP code.
   * 
   * @param secret The secret key used for generating the TOTP.
   * @param window The time window in seconds (default is 30 seconds).
   * @param timeOffset The time offset in seconds (default is 0).
   * @returns The generated TOTP code.
   */
  public generate(secret: string, window: number = 30, timeOffset: number = 0): string {
    return this.#generateCode(secret, window, timeOffset);
  }

  /**
   * Validates a TOTP code.
   * 
   * @param otp The TOTP code to validate.
   * @param secret The secret key used for generating the TOTP.
   * @param windowSize The time window in seconds (default is 30 seconds).
   * @param timeOffset The time offset in seconds (default is 0).
   * @returns A boolean indicating whether the TOTP code is valid.
   */
  public validate(otp: string, secret: string, windowSize: number = 30, timeOffset: number = 0): boolean {
    return this.#validateCode(otp, secret, windowSize, timeOffset);
  }
}


/**
 * Generates a Time-based One-Time Password (TOTP) using either TOTP32 or TOTP64 based on environment support.
 * 
 * @param secret The secret key used for generating the TOTP.
 * @param windowSize The time window in seconds (default is 30 seconds).
 * @param timeOffset The time offset in seconds (default is 0).
 * @returns The generated TOTP code.
 */
export function generateTOTP(secret: string, windowSize: number = 30, timeOffset: number = 0): string {
  if(typeof process === 'undefined' ||
    typeof crypto === 'undefined') return TOTP32.generate(secret, windowSize, timeOffset);

  return (new TOTP64()).generate(secret, windowSize, timeOffset);
}

/**
 * Validates a Time-based One-Time Password (TOTP) using either TOTP32 or TOTP64 based on environment support.
 * 
 * @param otp The TOTP code to validate.
 * @param secret The secret key used for generating the TOTP.
 * @param windowSize The time window in seconds (default is 30 seconds).
 * @param timeOffset The time offset in seconds (default is 0).
 * @returns A boolean indicating whether the TOTP code is valid.
 */
export function validateTOTP(otp: string, secret: string, windowSize: number = 30, timeOffset: number = 0): boolean {
  if(typeof process === 'undefined' ||
    typeof crypto === 'undefined') return TOTP32.validate(otp, secret, windowSize, timeOffset);

  return (new TOTP64()).validate(otp, secret, windowSize, timeOffset);
}

