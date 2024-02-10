import math from 'typesdk/math';

import { base32Decode, hmacSHA1 } from './core';


/**
 * OTP64 class for generating and validating One-Time Passwords (OTP) using the SHA1 algorithm with base64 encoding.
 */
export class OTP64 {
  #crypt: typeof import('crypto');

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    this.#crypt = require('crypto');
  }
  
  /**
   * Generates a One-Time Password (OTP).
   * 
   * @param secret The secret key used for generating the OTP.
   * @param length The length of the OTP (default is 6).
   * @returns The generated OTP.
   */
  public generate(secret: string, length: number = 6): string {
    const hmacDigest = this.#crypt.createHmac('sha1', Buffer.from(secret, 'base64')).digest('hex');
    const otp = parseInt(hmacDigest.substr(hmacDigest.length - 10), 16) % math.pow(10, length);

    return otp.toString().padStart(length, '0');
  }

  /**
   * Validates a One-Time Password (OTP).
   * 
   * @param otp The OTP to validate.
   * @param secret The secret key used for generating the OTP.
   * @param validDuration The validity duration of the OTP in seconds (default is 30 seconds).
   * @returns A boolean indicating whether the OTP is valid.
   */
  public validate(otp: string, secret: string,/* generatedAt: number,*/ validDuration: number = 30): boolean {
    // const currentTime = Math.floor(Date.now() / 1000);
    // const timeDifference = currentTime - generatedAt;
    const windowSize = math.ceil(validDuration / 30); // Assuming each TOTP window is 30 seconds

    for(let i = 0; i < windowSize; i++) {
      const tempOTP = this.generate(secret, otp.length);
      if (tempOTP === otp) return true;
    }

    return false;
  }

}


/**
 * OTP32 class for generating and validating One-Time Passwords (OTP) using the SHA1 algorithm with base32 encoding.
 */
export class OTP32 {

  /**
   * Generates a One-Time Password (OTP).
   * 
   * @param secret The secret key used for generating the OTP.
   * @param length The length of the OTP (default is 6).
   * @returns The generated OTP.
   */
  public static generate(secret: string, length: number = 6): string {
    const decodedSecret = base32Decode(secret);
    const counter = new Uint8Array(8);

    for(let i = 0; i < 8; i++) {
      counter[7 - i] = (Date.now() / 1000 >> (i * 8)) & 0xFF;
    }

    const hash = hmacSHA1(decodedSecret, counter);
    const offset = hash[hash.length - 1] & 0xf;

    const binary =
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff);

    const otp = binary % Math.pow(10, length);
    return otp.toString().padStart(length, '0');
  }

  /**
   * Validates a One-Time Password (OTP).
   * 
   * @param otp The OTP to validate.
   * @param secret The secret key used for generating the OTP.
   * @param validDuration The validity duration of the OTP in seconds (default is 30 seconds).
   * @returns A boolean indicating whether the OTP is valid.
   */
  public static validate(otp: string, secret: string,/* generatedAt: number,*/ validDuration: number = 30): boolean {
    // const currentTime = math.floor(Date.now() / 1000);
    // const timeDifference = currentTime - generatedAt;
    const windowSize = math.ceil(validDuration / 30);

    for(let i = 0; i < windowSize; i++) {
      const tempOTP = this.generate(secret, otp.length);
      if(tempOTP === otp) return true;
    }

    return false;
  }
}


/**
 * Generates a One-Time Password (OTP) using either OTP32 or OTP64 based on environment support.
 * 
 * @param secret The secret key used for generating the OTP.
 * @param length The length of the OTP (default is 6).
 * @returns The generated OTP.
 */
export function generateOTP(secret: string, length: number = 6): string {
  if(typeof process === 'undefined' ||
    typeof crypto === 'undefined') return OTP32.generate(secret, length);

  return new OTP64().generate(secret, length);
}


/**
 * Validates a One-Time Password (OTP) using either OTP32 or OTP64 based on environment support.
 * 
 * @param otp The OTP to validate.
 * @param secret The secret key used for generating the OTP.
 * @param validDuration The validity duration of the OTP in seconds (default is 30 seconds).
 * @returns A boolean indicating whether the OTP is valid.
 */
export function validateOTP(otp: string, secret: string,/* generatedAt: number,*/ validDuration: number = 30): boolean {
  if(typeof process === 'undefined' ||
    typeof crypto === 'undefined') return OTP32.validate(otp, secret, validDuration);

  return (new OTP64()).validate(otp, secret, validDuration);
}
