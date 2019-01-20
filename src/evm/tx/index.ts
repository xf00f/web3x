import { Address } from '../../address';

export interface Tx {
  nonce: number;
  gasPrice: number;
  gasLimit: number;
  to: Address;
  value: bigint;
  v: string;
  r: string;
  s: string;
}

export interface ContractCreationTx extends Tx {
  init: Buffer;
}

export interface MessageTx extends Tx {
  data: Buffer;
}
