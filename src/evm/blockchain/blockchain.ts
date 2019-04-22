import { EventEmitter } from 'events';
import { LevelUp } from 'levelup';
import * as rlp from 'rlp';
import { Address } from '../../address';
import { bufferToHex, sha3Buffer } from '../../utils';
import { Trie } from '../trie';
import { Log } from '../tx';
import { deserializeTx } from '../tx/tx';
import { deserializeTxReceipt } from '../tx/tx-receipt';
import { BlockHeader, deserializeBlockHeader, serializeBlockHeader } from './block-header';
import { createBlockState } from './block-state';
import { EvaluatedTx } from './mine-txs';

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

export class Blockchain extends EventEmitter {
  constructor(public db: LevelUp, private blockHeaders: BlockHeader[], private blockHashes: Buffer[]) {
    super();
  }

  public static async fromDb(db: LevelUp) {
    const getChainTip = async () => {
      try {
        return await db.get(Buffer.from('chainTip'));
      } catch (err) {
        return null;
      }
    };
    let blockHash = await getChainTip();
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

  public async mineTransactions(stateRoot: Buffer, blockchainCtx: BlockchainContext, evaluatedTxs: EvaluatedTx[]) {
    const { coinbase, timestamp, difficulty, blockGasLimit } = blockchainCtx;
    const blockNumber = this.getNextBlockNumber();
    const parentHash = this.blockHashes.length ? this.blockHashes[this.blockHashes.length - 1] : Buffer.of();
    const blockState = createBlockState(
      stateRoot,
      parentHash,
      blockNumber,
      coinbase,
      timestamp,
      difficulty,
      blockGasLimit,
      evaluatedTxs,
      this.db,
    );
    const blockHeader = blockState.header;

    // Add block to db.
    const serializedBlockHeader = serializeBlockHeader(blockHeader);
    const blockHash = sha3Buffer(serializedBlockHeader);
    await this.db.put(blockHash, serializedBlockHeader);

    this.blockHeaders.push(blockHeader);
    this.blockHashes.push(blockHash);

    // Record new chaintip.
    await this.db.put(Buffer.from('chainTip'), blockHash);

    // Add lookup for transactions. txHash => [blockHash, txIndex, from].
    await Promise.all(
      evaluatedTxs.map(({ txHash, sender }, i) =>
        this.db.put(txHash, rlp.encode([blockHash, Buffer.from(i.toString()), sender.toBuffer()])),
      ),
    );

    this.emit('newHeads', blockHeader, blockHash);

    evaluatedTxs.forEach(({ receipt, txHash }, transactionIndex) => {
      const result = {
        blockHash: bufferToHex(blockHash),
        blockNumber,
        transactionIndex,
        transactionHash: bufferToHex(txHash),
      };
      receipt.logs.forEach(({ data, address, topics }, logIndex) => {
        this.emit('logs', { ...result, logIndex, data: bufferToHex(data), address, topics: topics.map(bufferToHex) });
      });
    });
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
