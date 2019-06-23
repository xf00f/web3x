/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { toBigIntBE, toBufferBE } from 'bigint-buffer';
import BN from 'bn.js';
import * as rlp from 'rlp';
import { Address } from 'web3x/address';
import { Log } from './tx-substrate';

export interface TxReceipt {
  cumulativeGasUsed: bigint;
  logs: Log[];
  logsBloomFilter: Buffer;
  status: boolean;
}

export function serializeTxReceipt(txReceipt: TxReceipt) {
  const { cumulativeGasUsed, logs, logsBloomFilter, status } = txReceipt;
  return rlp.encode([
    status ? new BN(1) : new BN(0),
    toBufferBE(cumulativeGasUsed, 32),
    logsBloomFilter,
    logs.map(log => [log.address.toBuffer(), log.topics, log.data]),
  ]);
}

export function deserializeTxReceipt(data: Buffer): TxReceipt {
  const bufs: Buffer[] = rlp.decode(data) as any;
  const logs: Buffer[][] = bufs[3] as any;
  return {
    status: toBigIntBE(bufs[0]) > 0,
    cumulativeGasUsed: toBigIntBE(bufs[1]),
    logsBloomFilter: bufs[2],
    logs: logs.map(logBufs => ({
      address: new Address(logBufs[0]),
      topics: logBufs[1] as any,
      data: logBufs[2],
    })),
  };
}
