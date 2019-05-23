/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import * as rlp from 'rlp';
import { Address } from 'web3x/address';
import { sha3Buffer } from 'web3x/utils';
import { Trie } from '../trie';
import { deserializeTx, serializeTx, Tx } from '../tx';
import { BlockHeader, deserializeBlockHeader, serializeBlockHeader } from './block-header';
import { EvaluatedTx } from './evaluate-txs';

export interface BlockState {
  header: BlockHeader;
  uncles: BlockHeader[];
  transactions: Tx[];
  serializedHeader: Buffer;
  blockHash: Buffer;
}

export function createBlockState(
  stateRoot: Buffer,
  parentHash: Buffer,
  blockNumber: number,
  coinbase: Address,
  timestamp: number,
  difficulty: bigint,
  blockGasLimit: bigint,
  evaluatedTxs: EvaluatedTx[],
): BlockState {
  const txs = evaluatedTxs.map(etx => etx.tx);

  const receiptTrie = new Trie();
  evaluatedTxs.forEach(({ serializedReceipt }, i) => receiptTrie.put(sha3Buffer(i.toString()), serializedReceipt));

  const txTrie = new Trie();
  evaluatedTxs.forEach(({ serializedTx }, i) => txTrie.put(sha3Buffer(i.toString()), serializedTx));

  const blockHeader: BlockHeader = {
    parentHash,
    sha3Uncles: Buffer.of(),
    miner: coinbase,
    stateRoot,
    transactionsRoot: txTrie.root,
    receiptsRoot: receiptTrie.root,
    logsBloom: Buffer.of(),
    difficulty,
    number: blockNumber,
    gasLimit: blockGasLimit,
    gasUsed: BigInt(0),
    timestamp,
    extraData: Buffer.of(),
    mixHash: Buffer.of(),
    nonce: 0,
  };

  const serializedHeader = serializeBlockHeader(blockHeader);
  const blockHash = sha3Buffer(serializedHeader);

  return {
    header: blockHeader,
    transactions: txs,
    uncles: [],
    serializedHeader,
    blockHash,
  };
}

export function serializeBlockState(blockState: BlockState) {
  return rlp.encode([blockState.serializedHeader, blockState.transactions.map(serializeTx), blockState.blockHash]);
}

export function deserializeBlockState(data: Buffer) {
  const bufs: Buffer[] = rlp.decode(data) as any;
  const txBufs: Buffer[] = bufs[1] as any;
  const serializedHeader = bufs[0];
  return {
    header: deserializeBlockHeader(serializedHeader),
    transactions: txBufs.map(deserializeTx),
    uncles: [],
    serializedHeader,
    blockHash: bufs[2],
  } as BlockState;
}
