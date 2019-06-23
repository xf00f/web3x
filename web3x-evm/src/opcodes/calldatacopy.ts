/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class CallDataCopyOp implements OpCode {
  public readonly code = 0x37;
  public readonly mnemonic = 'CALLDATACOPY';
  public readonly description = 'Copy input data in current environment to memory';
  public readonly gas = 3;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const target = context.stack.pop();
    const source = Number(context.stack.pop());
    const length = Number(context.stack.pop());
    const buf = Buffer.alloc(length);
    context.calldata.copy(buf, 0, source, source + length);
    context.memory.storeN(target, buf);
    context.ip += this.bytes;
  }
}

export const CallDataCopy = new CallDataCopyOp();
