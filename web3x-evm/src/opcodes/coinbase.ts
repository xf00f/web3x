/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { toBigIntBE } from 'bigint-buffer';
import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class CoinbaseOp implements OpCode {
  public readonly code = 0x41;
  public readonly mnemonic = 'COINBASE';
  public readonly description = 'Get the blocks coinbase adddress.';
  public readonly gas = 1;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    context.stack.push(toBigIntBE(context.blockchainCtx.coinbase.toBuffer()));
    context.ip += this.bytes;
  }
}

export const Coinbase = new CoinbaseOp();
