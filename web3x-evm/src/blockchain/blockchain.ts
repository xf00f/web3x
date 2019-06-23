/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { EventEmitter } from 'events';
import { LevelUp } from 'levelup';
import * as rlp from 'rlp';
import { Address } from 'web3x/address';
import { bufferToHex, sha3Buffer } from 'web3x/utils';
import { Trie } from '../trie';
import { Log } from '../tx';
import { deserializeTx } from '../tx/tx';
import { deserializeTxReceipt } from '../tx/tx-receipt';
import { BlockHeader, deserializeBlockHeader, serializeBlockHeader } from './block-header';
import { BlockState } from './block-state';
import { EvaluatedTx } from './evaluate-txs';

export interface BlockchainContext {
  blockNumber: number;
  last256BlockHashes: Buffer[];
  coinbase: Address;
  timestamp: number;
  difficulty: bigint;
  blockGasLimit: bigint;
}

export type GetLogsResult = {
  block: BlockHeader;
  blockHash: Buffer;
  transactionIndex: number;
  transactionHash: Buffer;
  log: Log;
}[];

const getChainTip = async (db: LevelUp) => {
  try {
    return (await db.get(Buffer.from('chainTip'))) as Buffer;
  } catch (err) {
    return null;
  }
};

export class Blockchain extends EventEmitter {
  constructor(public db: LevelUp, private blockHeaders: BlockHeader[], private blockHashes: Buffer[]) {
    super();
  }

  public static async fromDb(db: LevelUp) {
    let blockHash = await getChainTip(db);
    const blocks: BlockHeader[] = [];
    const blockHashes: Buffer[] = [];
    if (blockHash) {
      while (true) {
        const block = deserializeBlockHeader(await db.get(blockHash));
        blocks.unshift(block);
        blockHashes.unshift(blockHash);
        if (block.parentHash.length === 0) {
          break;
        }
        blockHash = block.parentHash;
      }
    }
    return new Blockchain(db, blocks, blockHashes);
  }

  private getNextBlockNumber() {
    return this.blockHeaders.length > 0 ? this.blockHeaders[this.blockHeaders.length - 1].number + 1 : 0;
  }

  public getContext(): BlockchainContext {
    return {
      coinbase: Address.ZERO,
      blockGasLimit: BigInt(0),
      timestamp: new Date().getTime(),
      blockNumber: this.getNextBlockNumber(),
      last256BlockHashes: this.blockHashes.slice(-256),
      difficulty: BigInt(0),
    };
  }

  public async addBlock(blockState: BlockState, evaluatedTxs: EvaluatedTx[]) {
    const { header, blockHash } = blockState;

    await this.addBlockToDb(blockState, evaluatedTxs);

    this.blockHeaders.push(header);
    this.blockHashes.push(blockHash);

    this.emit('newHeads', header, blockHash);

    evaluatedTxs.forEach(({ receipt, txHash }, transactionIndex) => {
      const result = {
        blockHash: bufferToHex(blockHash),
        blockNumber: header.number,
        transactionIndex,
        transactionHash: bufferToHex(txHash),
      };
      receipt.logs.forEach(({ data, address, topics }, logIndex) => {
        const msg = {
          ...result,
          logIndex,
          data: bufferToHex(data),
          address: address.toString(),
          topics: topics.map(bufferToHex),
        };
        this.emit('logs', msg);
      });
    });
  }

  private async addBlockToDb(blockState: BlockState, evaluatedTxs: EvaluatedTx[]) {
    const { blockHash, serializedHeader } = blockState;

    // If we are using the same underlying db, the block will already have been added. Check first.
    const chainTip = await getChainTip(this.db);
    if (chainTip && chainTip.equals(blockHash)) {
      return;
    }

    await this.db.put(blockHash, serializedHeader);

    // Record new chaintip.
    await this.db.put(Buffer.from('chainTip'), blockHash);

    const txTrie = new Trie(this.db);
    const receiptTrie = new Trie(this.db);

    await Promise.all(
      evaluatedTxs.map(async ({ txHash, sender, serializedTx, serializedReceipt }, i) => {
        await receiptTrie.put(sha3Buffer(i.toString()), serializedReceipt);
        await txTrie.put(sha3Buffer(i.toString()), serializedTx);

        // Add lookup for transactions. txHash => [blockHash, txIndex, from].
        await this.db.put(txHash, rlp.encode([blockHash, Buffer.from(i.toString()), sender.toBuffer()]));
      }),
    );
  }

  public async getMinedTransaction(txHash: Buffer) {
    const rlpEntry = await this.db.get(txHash);
    if (!rlpEntry) {
      return;
    }
    const lookup: Buffer[] = rlp.decode(rlpEntry) as any;
    const [blockHash, txIndex, from] = lookup;
    const blockHeader = deserializeBlockHeader(await this.db.get(blockHash));
    const txTrie = new Trie(this.db, blockHeader.transactionsRoot);
    const tx = deserializeTx(await txTrie.get(sha3Buffer(txIndex)));
    return { blockHash, blockHeader, tx, txIndex: +txIndex.toString(), from: new Address(from) };
  }

  public async getTransactionReceipt(txHash: Buffer) {
    try {
      const lookup: Buffer[] = rlp.decode(await this.db.get(txHash)) as any;
      const blockHeader = deserializeBlockHeader(await this.db.get(lookup[0]));
      const receiptTrie = new Trie(this.db, blockHeader.receiptsRoot);
      return deserializeTxReceipt(await receiptTrie.get(sha3Buffer(lookup[1])));
    } catch (err) {
      return null;
    }
  }

  private async indexKeyedTrieToArray(trie: Trie) {
    const result: Buffer[] = [];
    for (let i = 0; true; i++) {
      const data = await trie.get(sha3Buffer(i.toString()));
      if (!data) {
        return result;
      }
      result.push(data);
    }
  }

  public async getLogs(addresses: Address[], topics: (Buffer[] | null)[], fromBlock: number, toBlock: number) {
    if (
      fromBlock < 0 ||
      fromBlock > this.blockHeaders.length - 1 ||
      toBlock < 0 ||
      toBlock > this.blockHeaders.length - 1 ||
      toBlock < fromBlock
    ) {
      throw new Error('Bad fromBlock toBlock range.');
    }
    const blocks = this.blockHeaders.slice(fromBlock, toBlock + 1);
    // TODO: Filter for blocks with appropriate logsBloom.

    const logs: GetLogsResult = [];

    for (const block of blocks) {
      const blockHash = sha3Buffer(serializeBlockHeader(block));
      const receiptTrie = new Trie(this.db, block.receiptsRoot);
      const receipts = (await this.indexKeyedTrieToArray(receiptTrie)).map(deserializeTxReceipt);
      for (const [transactionIndex, receipt] of receipts.entries()) {
        /* TODO: Skip receipts that don't match filter.
        if (receipt.logsBloomFilter != topics) {
          continue;
        }
        */
        const txTrie = new Trie(this.db, block.transactionsRoot);
        const txData = await txTrie.get(sha3Buffer(transactionIndex.toString()));
        const transactionHash = sha3Buffer(txData);
        // Add another filter before map to only push topics of interest.
        logs.push(
          ...receipt.logs
            .filter(log => addresses.some(a => a.equals(log.address)))
            .filter(log => topicsMatch(log.topics, topics))
            .map(log => ({ block, blockHash, log, transactionIndex, transactionHash })),
        );
      }
    }

    return logs;
  }

  public getChaintip() {
    return this.blockHeaders[this.blockHeaders.length - 1];
  }
}

function topicsMatch(logTopics: Buffer[], topics: (Buffer[] | null)[]) {
  return logTopics.every((logTopic, index) => {
    const topic = topics[index];
    return topic === null ? true : topic.some(topicMatcher => topicMatcher.equals(logTopic));
  });
}
