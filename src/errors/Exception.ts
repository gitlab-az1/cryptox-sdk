import { Exception as BaseError } from 'typesdk/errors';


export class Exception extends BaseError {
  constructor(message: string, reason: string, contextObject?: Record<string, any>) {
    super(message, { ...contextObject, reason });
  }
}

export default Exception;
