/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class InvalidOp implements OpCode {
  public readonly code = 0xfe;
  public readonly mnemonic = 'INVALID';
  public readonly description = 'Designated invalid instruction';
  public readonly gas = 0;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    throw new Error('Invalid instruction');
  }
}

export const Invalid = new InvalidOp();
