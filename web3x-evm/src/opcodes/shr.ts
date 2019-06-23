/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class ShrOp implements OpCode {
  public readonly code = 0x1c;
  public readonly mnemonic = 'SHR';
  public readonly description = 'Bitwise shift right';
  public readonly gas = 3;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const v1 = context.stack.pop()!;
    const v2 = context.stack.pop()!;
    context.stack.push(v2 >> v1);
    context.ip += this.bytes;
  }
}

export const Shr = new ShrOp();
