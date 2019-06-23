/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import BN from 'bn.js';
import * as rlp from 'rlp';
import { Address } from 'web3x/address';

export interface BlockHeader {
  parentHash: Buffer;
  sha3Uncles: Buffer;
  miner: Address;
  stateRoot: Buffer;
  transactionsRoot: Buffer;
  receiptsRoot: Buffer;
  logsBloom: Buffer;
  difficulty: bigint;
  number: number;
  gasLimit: bigint;
  gasUsed: bigint;
  timestamp: number;
  extraData: Buffer;
  mixHash: Buffer;
  nonce: number;
}

export function serializeBlockHeader(blockHeader: BlockHeader) {
  return rlp.encode([
    blockHeader.parentHash,
    blockHeader.stateRoot,
    blockHeader.transactionsRoot,
    blockHeader.receiptsRoot,
    blockHeader.number,
  ]);
}

export function deserializeBlockHeader(data: Buffer) {
  const bufs: Buffer[] = rlp.decode(data) as any;
  return {
    parentHash: bufs[0],
    sha3Uncles: Buffer.of(),
    miner: Address.ZERO,
    stateRoot: bufs[1],
    transactionsRoot: bufs[2],
    receiptsRoot: bufs[3],
    logsBloom: Buffer.of(),
    difficulty: BigInt(0),
    number: new BN(bufs[4]).toNumber(),
    gasLimit: BigInt(0),
    gasUsed: BigInt(0),
    timestamp: new Date().getTime(),
    extraData: Buffer.of(),
    mixHash: Buffer.of(),
    nonce: 0,
  } as BlockHeader;
}
