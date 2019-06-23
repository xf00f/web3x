/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class MsizeOp implements OpCode {
  public readonly code = 0x59;
  public readonly mnemonic = 'MSIZE';
  public readonly description = 'Get size of active memory in bytes';
  public readonly gas = 2;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    context.stack.push(context.memory.activeMemoryWords() * BigInt(32));
    context.ip += this.bytes;
  }
}

export const Msize = new MsizeOp();
