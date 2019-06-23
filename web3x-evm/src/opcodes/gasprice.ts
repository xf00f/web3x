/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class GasPriceOp implements OpCode {
  public readonly code = 0x3a;
  public readonly mnemonic = 'GASPRICE';
  public readonly description = 'Get the transaction gas price.';
  public readonly gas = 1;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    context.stack.push(context.gasPrice);
    context.ip += this.bytes;
  }
}

export const GasPrice = new GasPriceOp();
