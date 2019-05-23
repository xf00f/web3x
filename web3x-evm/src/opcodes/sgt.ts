/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class SgtOp implements OpCode {
  public readonly code = 0x13;
  public readonly mnemonic = 'SGT';
  public readonly description = 'Signed greater-than comparison';
  public readonly gas = 3;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public sgt(x: bigint, y: bigint) {
    const tt255 = BigInt(2) ** BigInt(255);
    const xSign = x - tt255;
    const ySign = y - tt255;
    if (xSign >= 0 && ySign < 0) {
      return BigInt(0);
    } else if (xSign < 0 && ySign >= 0) {
      return BigInt(1);
    } else {
      return x > y ? BigInt(1) : BigInt(0);
    }
  }

  public handle(context: EvmContext) {
    const x = context.stack.pop()!;
    const y = context.stack.pop()!;
    context.stack.push(this.sgt(x, y));
    context.ip += this.bytes;
  }
}

export const Sgt = new SgtOp();
