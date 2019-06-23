/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { toBigIntBE } from 'bigint-buffer';
import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class OriginOp implements OpCode {
  public readonly code = 0x32;
  public readonly mnemonic = 'ORIGIN';
  public readonly description = 'Get the origin address.';
  public readonly gas = 1;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    context.stack.push(toBigIntBE(context.origin.toBuffer()));
    context.ip += this.bytes;
  }
}

export const Origin = new OriginOp();
