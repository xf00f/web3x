/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { OpCode, OpCodes } from '.';
import { EvmContext } from '../vm/evm-context';

class JumpOp implements OpCode {
  public readonly code = 0x56;
  public readonly mnemonic = 'JUMP';
  public readonly description = 'Alter the program counter';
  public readonly gas = 8;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const nip = Number(context.stack.pop());
    const opcode = OpCodes[context.code[nip]];
    if (!opcode || opcode.mnemonic !== 'JUMPDEST') {
      throw new Error('Invalid jump destination.');
    }
    context.ip = nip;
  }
}

export const Jump = new JumpOp();
