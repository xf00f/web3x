/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { LevelUp } from 'levelup';
import bn128 from 'rustbn.js';
import { Address } from 'web3x/address';
import { Trie } from '../../trie';
import { EvmContext } from '../../vm';
import { EvmAccount } from '../evm-account';

export class EcMulAccount extends EvmAccount {
  constructor(address: Address, nonce: bigint, balance: bigint, storage: Trie, code: Buffer) {
    super(address, nonce, balance, storage, code);
  }

  public static fromDb(db: LevelUp) {
    return new EcMulAccount(
      Address.fromString('0x0000000000000000000000000000000000000007'),
      BigInt(0),
      BigInt(0),
      new Trie(db),
      Buffer.of(),
    );
  }

  public async run(callContext: EvmContext) {
    const { calldata } = callContext;

    const result = bn128.mul(calldata);

    callContext.halt = true;

    if (result.length !== 64) {
      callContext.reverted = true;
      callContext.returned = Buffer.of();
    } else {
      callContext.returned = result;
    }

    return callContext;
  }
}
