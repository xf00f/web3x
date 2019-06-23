/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class JumpDestOp implements OpCode {
  public readonly code = 0x5b;
  public readonly mnemonic = 'JUMPDEST';
  public readonly description = 'Mark a valid destination for jumps';
  public readonly gas = 1;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    context.ip += this.bytes;
  }
}

export const JumpDest = new JumpDestOp();
