/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { Address } from 'web3x/address';
import { EvmAccount } from '../world/evm-account';

export interface Log {
  address: Address;
  topics: Buffer[];
  data: Buffer;
}

export class TxSubstrate {
  public selfDestructSet: EvmAccount[] = [];
  public logs: Log[] = [];
  public touchedAccounts: { [address: string]: EvmAccount } = {};
  public refundBalance: bigint = BigInt(0);
}
