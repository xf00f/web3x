/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class PcOp implements OpCode {
  public readonly code = 0x58;
  public readonly mnemonic = 'PC';
  public readonly description = 'Get program counter prior to this instructions incrementing';
  public readonly gas = 1;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    context.stack.push(BigInt(context.ip));
    context.ip += this.bytes;
  }
}

export const Pc = new PcOp();
