/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

const RANGE_MOD = BigInt(2) ** BigInt(256);
const MAX_INT = BigInt(2) ** BigInt(256) - BigInt(1);
const SIGN_BIT = BigInt(1) << BigInt(255);

class SdivOp implements OpCode {
  public readonly code = 0x05;
  public readonly mnemonic = 'SDIV';
  public readonly description = 'Signed integer division operation';
  public readonly gas = 5;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const [v1, v2] = context.stack.popN(2);
    if (v2 === BigInt(0)) {
      context.stack.push(BigInt(0));
    } else {
      const v1twos = v1 & SIGN_BIT ? -((v1 ^ MAX_INT) + BigInt(1)) : v1;
      const v2twos = v2 & SIGN_BIT ? -((v2 ^ MAX_INT) + BigInt(1)) : v2;
      const r = v1twos / v2twos;
      context.stack.push(r < 0 ? RANGE_MOD + r : r);
    }
    context.ip += this.bytes;
  }
}

export const Sdiv = new SdivOp();
