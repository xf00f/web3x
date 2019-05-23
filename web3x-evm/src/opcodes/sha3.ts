/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { toBigIntBE } from 'bigint-buffer';
import { sha3 } from 'web3x/utils';
import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class Sha3Op implements OpCode {
  public readonly code = 0x20;
  public readonly mnemonic = 'SHA3';
  public readonly description = 'Compute Keccak-256 hash';
  public readonly gas = 30;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const address = context.stack.pop()!;
    const length = context.stack.pop()!;
    const data = context.memory.loadN(address, Number(length));
    const result = toBigIntBE(Buffer.from(sha3(data).slice(2), 'hex'));
    context.stack.push(result);
    context.ip += this.bytes;
  }
}

export const Sha3 = new Sha3Op();
