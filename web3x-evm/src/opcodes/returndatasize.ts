/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class ReturnDataSizeOp implements OpCode {
  public readonly code = 0x3d;
  public readonly mnemonic = 'RETURNDATASIZE';
  public readonly description = 'Return size of returned data from last call';
  public readonly gas = 0;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    context.stack.push(BigInt(context.lastReturned.length));
    context.ip += this.bytes;
  }
}

export const ReturnDataSize = new ReturnDataSizeOp();
