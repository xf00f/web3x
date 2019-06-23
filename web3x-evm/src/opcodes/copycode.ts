/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class CopyCodeOp implements OpCode {
  public readonly code = 0x39;
  public readonly mnemonic = 'COPYCODE';
  public readonly description = 'Copy code from current environment to memory';
  public readonly gas = 3;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const destIndex = context.stack.pop()!;
    const runtimeOffset = Number(context.stack.pop()!);
    const runtimeLength = Number(context.stack.pop()!);
    const code = Buffer.alloc(runtimeLength);
    context.code.slice(runtimeOffset, runtimeOffset + runtimeLength).copy(code);
    context.memory.storeN(destIndex, code);
    context.ip += this.bytes;
  }
}

export const CopyCode = new CopyCodeOp();
