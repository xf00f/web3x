/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class CallValueOp implements OpCode {
  public readonly code = 0x34;
  public readonly mnemonic = 'CALLVALUE';
  public readonly description = 'Get deposited value by the instruction/transaction responsible for this execution';
  public readonly gas = 2;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    context.stack.push(context.executionValue);
    context.ip += this.bytes;
  }
}

export const CallValue = new CallValueOp();
