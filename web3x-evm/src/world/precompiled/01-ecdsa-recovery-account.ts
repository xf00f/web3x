/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { LevelUp } from 'levelup';
import { Address } from 'web3x/address';
import { bufferToHex, recover } from 'web3x/utils';
import { Trie } from '../../trie';
import { EvmContext } from '../../vm';
import { EvmAccount } from '../evm-account';

export class EcdsaRecoveryAccount extends EvmAccount {
  constructor(address: Address, nonce: bigint, balance: bigint, storage: Trie, code: Buffer) {
    super(address, nonce, balance, storage, code);
  }

  public static fromDb(db: LevelUp) {
    return new EcdsaRecoveryAccount(
      Address.fromString('0x0000000000000000000000000000000000000001'),
      BigInt(0),
      BigInt(0),
      new Trie(db),
      Buffer.of(),
    );
  }

  public async run(callContext: EvmContext) {
    const { calldata } = callContext;

    const h = calldata.slice(0, 32);
    const v = calldata.slice(32, 64);
    const r = calldata.slice(64, 96);
    const s = calldata.slice(96, 128);

    const result = recover(bufferToHex(h), bufferToHex(v), bufferToHex(r), bufferToHex(s), true).toBuffer32();
    callContext.halt = true;
    callContext.returned = result;

    return callContext;
  }
}
