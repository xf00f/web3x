/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class RevertOp implements OpCode {
  public readonly code = 0xfd;
  public readonly mnemonic = 'REVERT';
  public readonly description =
    'Stop execution and revert state changes, without consuming all provided gas and providing a reason';
  public readonly gas = 0;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const [offset, length] = context.stack.popN(2);
    context.returned = context.memory.loadN(offset, Number(length));
    context.halt = true;
    context.reverted = true;
    context.ip += this.bytes;
  }
}

export const Revert = new RevertOp();
