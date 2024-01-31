import CanceledError from '../errors/CanceledError';



export interface Thenable<T> extends PromiseLike<T> { }

export interface CancelablePromise<T> extends Promise<T> {
  cancel(): void;
}

export type ValueCallback<T = unknown> = (value: T | Promise<T>) => void;

const enum DeferredOutcome {
  Resolved,
  Rejected
}


export class Deferred<T, E = unknown> {
  private _onfulfilled: ValueCallback<T>;
  private _onrejected: (reason?: E) => void;
  private _outcome?: { outcome: DeferredOutcome.Resolved, value: T } | { outcome: DeferredOutcome.Rejected, reason?: E };

  public readonly promise: Promise<T>;

  public constructor() {
    this.promise = new Promise((resolve, reject) => {
      [this._onfulfilled, this._onrejected] = [resolve, reject];
    });
  }

  public get isRejected() {
    return this._outcome?.outcome === DeferredOutcome.Rejected;
  }

  public get isResolved() {
    return this._outcome?.outcome === DeferredOutcome.Resolved;
  }

  public get value(): T | undefined {
    if(this._outcome?.outcome === DeferredOutcome.Resolved) return this._outcome.value;
    return undefined;
  }

  public resolve(value: T): Promise<void> {
    return new Promise<void>(resolve => {
      this._onfulfilled(value);

      this._outcome = {
        outcome: DeferredOutcome.Resolved,
        value,
      } as const;

      resolve();
    });
  }

  public reject(reason?: E): Promise<void> {
    return new Promise<void>(resolve => {
      this._onrejected(reason);

      this._outcome = {
        outcome: DeferredOutcome.Rejected,
        reason,
      } as const;

      resolve();
    });
  }

  public cancel(): void {
    this.reject(new CanceledError() as unknown as any);
  }
}


export function delay(amount: number = 750) {
  return new Promise(resolve => setTimeout(resolve, amount));
}

export function isThenable<T>(obj: unknown): obj is Promise<T> {
  return !!obj && typeof (obj as unknown as Promise<T>).then === 'function';
}


export function asPromise<T>(callback: () => T | Thenable<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const item = callback();

    if(isThenable<T>(item)) return item.then(resolve, reject);
    return resolve(item);
  });
}
