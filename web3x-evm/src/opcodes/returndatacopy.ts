/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class ReturnDataCopyOp implements OpCode {
  public readonly code = 0x3e;
  public readonly mnemonic = 'RETURNDATACOPY';
  public readonly description = 'Copy output data from the previous call to memory.';
  public readonly gas = 3;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const target = context.stack.pop();
    const source = Number(context.stack.pop());
    const length = Number(context.stack.pop());
    const buf = context.lastReturned.slice(source, source + length);
    context.memory.storeN(target, buf);
    context.ip += this.bytes;
  }
}

export const ReturnDataCopy = new ReturnDataCopyOp();
