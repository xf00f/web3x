/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class MstoreOp implements OpCode {
  public readonly code = 0x52;
  public readonly mnemonic = 'MSTORE';
  public readonly description = 'Save word to memory';
  public readonly gas = 3;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const address = context.stack.pop()!;
    const value = context.stack.pop()!;
    context.memory.storeWord(address, value);
    context.ip += this.bytes;
  }
}

export const Mstore = new MstoreOp();
