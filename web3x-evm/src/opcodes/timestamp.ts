/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class TimestampOp implements OpCode {
  public readonly code = 0x42;
  public readonly mnemonic = 'TIMESTAMP';
  public readonly description = 'Get the blocks timestamp.';
  public readonly gas = 1;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    context.stack.push(BigInt(context.blockchainCtx.timestamp));
    context.ip += this.bytes;
  }
}

export const Timestamp = new TimestampOp();
