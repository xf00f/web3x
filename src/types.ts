export type Callback<T> = (error: Error, result: T) => void;

export type Address = string;
export type TransactionHash = string;
export type Quantity = string | number;
export type Data = string;

export interface Tx {
  nonce?: string | number;
  chainId?: string | number;
  from?: string;
  to?: string;
  data?: string;
  value?: string | number;
  gas?: string | number;
  gasPrice?: string | number;
}

export type BlockType = 'latest' | 'pending' | 'genesis' | number;
export type BlockHash = string;

export interface BlockHeader {
  number: number;
  hash: string;
  parentHash: string;
  nonce: string;
  sha3Uncles: string;
  logsBloom: string;
  transactionRoot: string;
  stateRoot: string;
  receiptRoot: string;
  miner: string;
  extraData: string;
  gasLimit: number;
  gasUsed: number;
  timestamp: number;
}

export interface Block extends BlockHeader {
  transactions: Transaction[];
  size: number;
  difficulty: number;
  totalDifficulty: number;
  uncles: string[];
}

export interface Transaction {
  hash: string;
  nonce: number;
  blockHash: string;
  blockNumber: number;
  transactionIndex: number;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gas: number;
  input: string;
  v?: string;
  r?: string;
  s?: string;
}

export interface EncodedTransaction {
  raw: string;
  tx: {
    nonce: string;
    gasPrice: string;
    gas: string;
    to: string;
    value: string;
    input: string;
    v: string;
    r: string;
    s: string;
    hash: string;
  };
}
