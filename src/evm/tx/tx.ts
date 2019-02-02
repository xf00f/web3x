import { Address } from '../../address';

export interface Tx {
  nonce: bigint;
  to?: Address;
  dataOrInit: Buffer;
  gasPrice: bigint;
  gasLimit: bigint;
  value: bigint;
  v: string;
  r: string;
  s: string;
}
