/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { OpCode, OpCodes } from '.';
import { EvmContext } from '../vm/evm-context';

class JumpiOp implements OpCode {
  public readonly code = 0x57;
  public readonly mnemonic = 'JUMPI';
  public readonly description = 'Conditionally alter the program counter';
  public readonly gas = 10;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const [ip, condition] = context.stack.popN(2);
    if (condition === BigInt(0)) {
      context.ip += 1;
    } else {
      const nip = Number(ip);
      if (OpCodes[context.code[nip]].mnemonic !== 'JUMPDEST') {
        throw new Error('Invalid jump destination.');
      }
      context.ip = nip;
    }
  }
}

export const Jumpi = new JumpiOp();
