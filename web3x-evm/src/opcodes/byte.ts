/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { toBufferBE } from 'bigint-buffer';
import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class ByteOp implements OpCode {
  public readonly code = 0x1a;
  public readonly mnemonic = 'BYTE';
  public readonly description = 'Extract a single byte from a 32 byte word.';
  public readonly gas = 3;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const n = context.stack.pop()!;
    const v = context.stack.pop()!;
    if (n < 32) {
      const vBuf = toBufferBE(v, 32);
      context.stack.push(BigInt(vBuf[Number(n)]));
    } else {
      context.stack.push(BigInt(0));
    }
    context.ip += this.bytes;
  }
}

export const Byte = new ByteOp();
