/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { toBigIntBE } from 'bigint-buffer';
import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class PushOp implements OpCode {
  public readonly mnemonic: string;
  public readonly description: string;
  public readonly gas = 3;
  public readonly bytes: number;

  constructor(readonly code: number, size: number) {
    this.bytes = size + 1;
    this.mnemonic = 'PUSH' + size;
    this.description = `Place ${size} byte item on stack`;
  }

  public toString(params: Buffer): string {
    return `${this.mnemonic} 0x${params.toString('hex')}`;
  }

  public handle(context: EvmContext) {
    const { code, stack, ip } = context;
    const toPush = toBigIntBE(code.slice(ip + 1, ip + this.bytes));
    stack.push(toPush);
    context.ip += this.bytes;
  }
}

export const PushOps = new Array(32).fill(0).map((_, i) => new PushOp(0x60 + i, i + 1));
