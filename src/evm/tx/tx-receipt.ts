import { Address } from '../../address';
import { Log } from './tx-substrate';

export interface TxReceipt {
  from: Address;
  to?: Address;
  contractAddress?: Address;
  cumulativeGasUsed: bigint;
  gasUsed: bigint;
  logs: Log[];
  // logsBloomFilter: Buffer;
  status: boolean;
}
