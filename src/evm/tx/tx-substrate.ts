import { Address } from '../../address';
import { EvmAccount } from '../world/evm-account';

export interface Log {
  address: Address;
  topics: Buffer[];
  data: Buffer;
}

export class TxSubstrate {
  public selfDestructSet: EvmAccount[] = [];
  public logs: Log[] = [];
  public touchedAccounts: { [address: string]: EvmAccount } = {};
  public refundBalance: bigint = BigInt(0);
}
