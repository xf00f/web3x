/*
  This file is part of web3x.

  web3x is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  web3x is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License
  along with web3x.  If not, see <http://www.gnu.org/licenses/>.
*/

import { EventEmitter } from 'events';

/**
 * This function generates a defer promise and adds eventEmitter functionality to it
 *
 * @method eventifiedPromise
 */
export class PromiEvent<T> implements Promise<T>, EventEmitter {
  public [Symbol.toStringTag]: 'Promise';

  public resolve!: (result: T) => void;
  public reject!: (reason?: any) => void;
  public emitter: EventEmitter;
  public promise!: Promise<T>;

  constructor(promise: Promise<T>, emitter: EventEmitter) {
    this.promise = promise;
    this.emitter = emitter;
  }

  public then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined,
  ) {
    return new PromiEvent(this.promise.then(onfulfilled, onrejected), this.emitter);
  }

  public catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
  ): PromiEvent<T | TResult> {
    return new PromiEvent(this.promise.catch(onrejected), this.emitter);
  }

  public addListener(event: string | symbol, listener: (...args: any[]) => void): this {
    this.emitter.addListener(event, listener);
    return this;
  }

  public on(event: string | symbol, listener: (...args: any[]) => void): this {
    this.emitter.on(event, listener);
    return this;
  }

  public once(event: string | symbol, listener: (...args: any[]) => void): this {
    this.emitter.once(event, listener);
    return this;
  }
  public prependListener(event: string | symbol, listener: (...args: any[]) => void): this {
    this.emitter.prependListener(event, listener);
    return this;
  }
  public prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this {
    this.emitter.prependOnceListener(event, listener);
    return this;
  }

  public removeListener(event: string | symbol, listener: (...args: any[]) => void): this {
    this.emitter.removeListener(event, listener);
    return this;
  }

  public off(event: string | symbol, listener: (...args: any[]) => void): this {
    this.emitter.off(event, listener);
    return this;
  }

  public removeAllListeners(event?: string | symbol | undefined): this {
    this.emitter.removeAllListeners(event);
    return this;
  }

  public setMaxListeners(n: number): this {
    this.emitter.setMaxListeners(n);
    return this;
  }

  public getMaxListeners(): number {
    return this.emitter.getMaxListeners();
  }

  // tslint:disable-next-line:ban-types
  public listeners(event: string | symbol): Function[] {
    return this.emitter.listeners(event);
  }

  // tslint:disable-next-line:ban-types
  public rawListeners(event: string | symbol): Function[] {
    return this.emitter.rawListeners(event);
  }

  public emit(event: string | symbol, ...args: any[]): boolean {
    return this.emitter.emit(event, ...args);
  }

  public eventNames(): (string | symbol)[] {
    return this.emitter.eventNames();
  }

  public listenerCount(type: string | symbol): number {
    return this.emitter.listenerCount(type);
  }
}

export interface PromiEventResult<T> {
  resolve: (result: T) => void;
  reject: (reason?: any) => void;
  eventEmitter: PromiEvent<T>;
}

export function promiEvent<T>(justPromise: boolean = false): PromiEventResult<T> {
  let resolve;
  let reject;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  if (justPromise) {
    return { resolve, reject, eventEmitter: promise as PromiEvent<T> };
  }

  const emitter = new EventEmitter();

  // Required to suppress default behaviour of throwing on emitting an error.
  emitter.on('error', () => {});

  const pe = new PromiEvent<T>(promise, emitter);
  return {
    resolve,
    reject,
    eventEmitter: pe,
  };
}

export function resolvedPromiEvent<T>(value: T) {
  const pe = promiEvent<T>(true);
  pe.resolve(value);
  return pe.eventEmitter;
}
