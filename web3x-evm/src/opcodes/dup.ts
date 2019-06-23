/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class DupOp implements OpCode {
  public readonly mnemonic: string;
  public readonly description: string;
  public readonly gas = 3;
  public readonly bytes: number;

  constructor(readonly code: number, private position: number) {
    this.bytes = 1;
    this.mnemonic = 'DUP' + position;
    this.description = `Duplicate stack item ${position}`;
  }

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const { stack } = context;
    stack.push(stack[stack.length - this.position]);
    context.ip += this.bytes;
  }
}

export const DupOps = new Array(16).fill(0).map((_, i) => new DupOp(0x80 + i, i + 1));
