import { LevelUp } from 'levelup';
import { Address } from '../../address';
import { Trie } from '../trie';
import { Tx, TxReceipt } from '../tx';
import { WorldState } from '../world/world-state';

export interface BlockHeader {
  parentHash: Buffer;
  uncleHash: Buffer;
  beneficiary: Address;
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

export interface Block {
  header: BlockHeader;
  uncles: BlockHeader[];
  transactions: Tx[];
}

export class Blockchain {
  public blocks: Block[] = [];
  public receipts: { [txHash: string]: TxReceipt } = {};

  /*
  constructor(public db: LevelUp) {}

  public mineTransactions(worldState: WorldState, txs: Tx[]) {
    const receipts = new Trie(this.db);
  }
  */
}
