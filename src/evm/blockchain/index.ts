import BN from 'bn.js';
import { EventEmitter } from 'events';
import { LevelUp } from 'levelup';
import * as rlp from 'rlp';
import { Address } from '../../address';
import { bufferToHex, sha3Buffer } from '../../utils';
import { Trie } from '../trie';
import { Log } from '../tx';
import { deserializeTx, serializeTx, Tx } from '../tx/tx';
import { deserializeTxReceipt, serializeTxReceipt, TxReceipt } from '../tx/tx-receipt';

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

export interface BlockState {
  header: BlockHeader;
  uncles: BlockHeader[];
  transactions: Tx[];
}

export type GetLogsResult = {
  block: BlockHeader;
  blockHash: Buffer;
  transactionIndex: number;
  transactionHash: Buffer;
  log: Log;
}[];

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

export class Blockchain extends EventEmitter {
  constructor(public db: LevelUp, private blocks: BlockHeader[]) {
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
    if (blockHash) {
      while (true) {
        const block = deserializeBlockHeader(await db.get(blockHash));
        blocks.unshift(block);
        if (block.parentHash.length === 0) {
          break;
        }
        blockHash = block.parentHash;
      }
    }
    return new Blockchain(db, blocks);
  }

  public async mineTransactions(stateRoot: Buffer, txs: Tx[], txReceipts: TxReceipt[]) {
    const parentBlock = this.blocks.length > 0 ? this.blocks[this.blocks.length - 1] : undefined;
    const blockNumber = parentBlock ? parentBlock.number + 1 : 0;
    const serializedTxs = txs.map(serializeTx);
    const txHashes = serializedTxs.map(sha3Buffer);

    const receiptTrie = new Trie(this.db);
    txReceipts.forEach((receipt, i) => receiptTrie.put(sha3Buffer(i.toString()), serializeTxReceipt(receipt)));

    const txTrie = new Trie(this.db);
    serializedTxs.forEach((tx, i) => txTrie.put(sha3Buffer(i.toString()), tx));

    const block = {
      parentHash: parentBlock ? sha3Buffer(serializeBlockHeader(parentBlock)) : Buffer.of(),
      sha3Uncles: Buffer.of(),
      miner: Address.ZERO,
      stateRoot,
      transactionsRoot: txTrie.root,
      receiptsRoot: receiptTrie.root,
      logsBloom: Buffer.of(),
      difficulty: BigInt(0),
      number: blockNumber,
      gasLimit: BigInt(0),
      gasUsed: BigInt(0),
      timestamp: new Date().getTime(),
      extraData: Buffer.of(),
      mixHash: Buffer.of(),
      nonce: 0,
    } as BlockHeader;

    this.blocks.push(block);

    // Add block to db.
    const serializedBlock = serializeBlockHeader(block);
    const blockHash = sha3Buffer(serializedBlock);
    await this.db.put(blockHash, serializedBlock);

    // Record new chaintip.
    await this.db.put(Buffer.from('chainTip'), blockHash);

    // Add lookup for transactions. txHash => [blockHash, txIndex].
    await Promise.all(
      txHashes.map((txHash, i) => this.db.put(txHash, rlp.encode([blockHash, sha3Buffer(i.toString())]))),
    );

    this.emit('newHeads', block, blockHash);

    txReceipts.forEach((receipt, transactionIndex) => {
      const transactionHash = txHashes[transactionIndex];
      const result = {
        blockHash: bufferToHex(blockHash),
        blockNumber,
        transactionIndex,
        transactionHash: bufferToHex(transactionHash),
      };
      receipt.logs.forEach(({ data, address, topics }, logIndex) => {
        this.emit('logs', { ...result, logIndex, data: bufferToHex(data), address, topics: topics.map(bufferToHex) });
      });
    });

    return txHashes;
  }

  public async getMinedTransaction(txHash: Buffer) {
    const lookup: Buffer[] = rlp.decode(await this.db.get(txHash)) as any;
    const blockHeader = deserializeBlockHeader(await this.db.get(lookup[0]));
    const txTrie = new Trie(this.db, blockHeader.transactionsRoot);
    return deserializeTx(await txTrie.get(lookup[1]));
  }

  public async getTransactionReceipt(txHash: Buffer) {
    try {
      const lookup: Buffer[] = rlp.decode(await this.db.get(txHash)) as any;
      const blockHeader = deserializeBlockHeader(await this.db.get(lookup[0]));
      const receiptTrie = new Trie(this.db, blockHeader.receiptsRoot);
      return deserializeTxReceipt(await receiptTrie.get(lookup[1]));
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
      fromBlock > this.blocks.length - 1 ||
      toBlock < 0 ||
      toBlock > this.blocks.length - 1 ||
      toBlock < fromBlock
    ) {
      throw new Error('Bad fromBlock toBlock range.');
    }
    const blocks = this.blocks.slice(fromBlock, toBlock + 1);
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
    return this.blocks[this.blocks.length - 1];
  }
}

function topicsMatch(logTopics: Buffer[], topics: (Buffer[] | null)[]) {
  return logTopics.every((logTopic, index) => {
    const topic = topics[index];
    return topic === null ? true : topic.some(topicMatcher => topicMatcher.equals(logTopic));
  });
}
