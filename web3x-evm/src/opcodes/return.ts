/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class ReturnOp implements OpCode {
  public readonly code = 0xf3;
  public readonly mnemonic = 'RETURN';
  public readonly description = 'Halt execution returning output data';
  public readonly gas = 0;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    context.halt = true;
    const index = context.stack.pop()!;
    const length = Number(context.stack.pop()!);
    context.returned = context.memory.loadN(index, length);
    context.ip += this.bytes;
  }
}

export const Return = new ReturnOp();
