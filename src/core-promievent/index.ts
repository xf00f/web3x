/*
 This file is part of web3.js.

 web3.js is free software: you can redistribute it and/or modify
 it under the terms of the GNU Lesser General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 web3.js is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public License
 along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * @file index.js
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2016
 */

import { EventEmitter } from 'events';
import { TransactionReceipt } from '../types';

/*
type PromiEventType = 'transactionHash' | 'receipt' | 'confirmation' | 'error';

export interface PromiEvent<T> extends Promise<T> {
  once(type: 'transactionHash', handler: (receipt: string) => void): PromiEvent<T>;
  once(type: 'receipt', handler: (receipt: TransactionReceipt) => void): PromiEvent<T>;
  once(type: 'confirmation', handler: (confNumber: number, receipt: TransactionReceipt) => void): PromiEvent<T>;
  once(type: 'error', handler: (error: Error) => void): PromiEvent<T>;
  once(type: PromiEventType, handler: (error: Error | TransactionReceipt | string) => void): PromiEvent<T>;
  on(type: 'transactionHash', handler: (receipt: string) => void): PromiEvent<T>;
  on(type: 'receipt', handler: (receipt: TransactionReceipt) => void): PromiEvent<T>;
  on(type: 'confirmation', handler: (confNumber: number, receipt: TransactionReceipt) => void): PromiEvent<T>;
  on(type: 'error', handler: (error: Error) => void): PromiEvent<T>;
  on(
    type: 'error' | 'confirmation' | 'receipt' | 'transactionHash',
    handler: (error: Error | TransactionReceipt | string) => void
  ): PromiEvent<T>;
}
*/

/**
 * This function generates a defer promise and adds eventEmitter functionality to it
 *
 * @method eventifiedPromise
 */
export class PromiEvent<T> implements Promise<T>, EventEmitter {
  [Symbol.toStringTag]: 'Promise';

  public resolve!: (result: T) => void;
  public reject!: (reason?: any) => void;
  public emitter: EventEmitter;
  public promise!: Promise<T>;

  constructor(promise: Promise<T>, emitter: EventEmitter) {
    this.promise = promise;
    this.emitter = emitter;
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined
  ) {
    return new PromiEvent(this.promise.then(onfulfilled, onrejected), this.emitter);
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
  ): PromiEvent<T | TResult> {
    return new PromiEvent(this.promise.catch(onrejected), this.emitter);
  }

  addListener(event: string | symbol, listener: (...args: any[]) => void): this {
    this.emitter.addListener(event, listener);
    return this;
  }

  on(event: string | symbol, listener: (...args: any[]) => void): this {
    this.emitter.on(event, listener);
    return this;
  }

  once(event: string | symbol, listener: (...args: any[]) => void): this {
    this.emitter.once(event, listener);
    return this;
  }
  prependListener(event: string | symbol, listener: (...args: any[]) => void): this {
    this.emitter.prependListener(event, listener);
    return this;
  }
  prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this {
    this.emitter.prependOnceListener(event, listener);
    return this;
  }

  removeListener(event: string | symbol, listener: (...args: any[]) => void): this {
    this.emitter.removeListener(event, listener);
    return this;
  }

  off(event: string | symbol, listener: (...args: any[]) => void): this {
    this.emitter.off(event, listener);
    return this;
  }

  removeAllListeners(event?: string | symbol | undefined): this {
    this.emitter.removeAllListeners(event);
    return this;
  }

  setMaxListeners(n: number): this {
    this.emitter.setMaxListeners(n);
    return this;
  }

  getMaxListeners(): number {
    return this.emitter.getMaxListeners();
  }

  listeners(event: string | symbol): Function[] {
    return this.emitter.listeners(event);
  }

  rawListeners(event: string | symbol): Function[] {
    return this.emitter.rawListeners(event);
  }

  emit(event: string | symbol, ...args: any[]): boolean {
    return this.emitter.emit(event, ...args);
  }

  eventNames(): (string | symbol)[] {
    return this.emitter.eventNames();
  }

  listenerCount(type: string | symbol): number {
    return this.emitter.listenerCount(type);
  }
}

export interface PromiEventResult<T> {
  resolve: (result: T) => void;
  reject: (reason?: any) => void;
  eventEmitter: PromiEvent<T>;
}

export function promiEvent<T>(justPromise: boolean = false): PromiEventResult<T> {
  let resolve, reject;
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
