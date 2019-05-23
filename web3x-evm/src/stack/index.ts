/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

export class Stack<T> extends Array<T> {
  constructor(items: T[] = []) {
    super(...items);
  }

  public pop(): T {
    if (this.length === 0) {
      throw new Error('Cannot pop empty stack.');
    }

    return super.pop()!;
  }

  public popN(n: number): T[] {
    if (this.length < n) {
      throw new Error('Insufficient elements on stack.');
    }

    return [...Array(n)].map(_ => super.pop()!);
  }

  public push(item: T): number {
    if (item === undefined || item === null) {
      throw new Error('Cannot push undefined/null on stack.');
    }

    return super.push(item);
  }
}
