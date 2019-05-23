/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { toBufferBE } from 'bigint-buffer';
import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class LogOp implements OpCode {
  public readonly mnemonic: string;
  public readonly description: string;
  public readonly gas: number;
  public readonly bytes: number;

  constructor(readonly code: number, private topics: number) {
    this.bytes = 1;
    this.gas = 375 * (topics + 1);
    this.mnemonic = 'LOG' + topics;
    this.description = `Append log record with ${topics} topics`;
  }

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const offset = context.stack.pop();
    const length = context.stack.pop();
    const data = context.memory.loadN(offset, Number(length));

    const topics: Buffer[] = [];
    for (let i = 0; i < this.topics; i++) {
      topics.push(toBufferBE(context.stack.pop(), 32));
    }

    context.txSubstrate.logs.push({ data, topics, address: context.executor });
    context.ip += this.bytes;
  }
}

export const LogOps = new Array(5).fill(0).map((_, i) => new LogOp(0xa0 + i, i));
