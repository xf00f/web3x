import { LevelUp } from 'levelup';
import { Address } from '../../address';
import { sha3Buffer } from '../../utils';
import { Trie } from '../trie';
import { serializeTx, serializeTxReceipt, Tx } from '../tx';
import { BlockHeader } from './block-header';
import { EvaluatedTx } from './mine-txs';

export interface BlockState {
  header: BlockHeader;
  uncles: BlockHeader[];
  transactions: Tx[];
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
  db?: LevelUp,
): BlockState {
  const txs = evaluatedTxs.map(etx => etx.tx);
  const serializedTxs = txs.map(serializeTx);

  const receiptTrie = new Trie(db);
  evaluatedTxs
    .map(etx => etx.receipt)
    .forEach((receipt, i) => receiptTrie.put(sha3Buffer(i.toString()), serializeTxReceipt(receipt)));

  const txTrie = new Trie(db);
  serializedTxs.forEach((tx, i) => txTrie.put(sha3Buffer(i.toString()), tx));

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

  return {
    header: blockHeader,
    transactions: txs,
    uncles: [],
  };
}
