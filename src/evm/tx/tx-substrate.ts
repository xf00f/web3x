import { EvmAccount } from '../world/evm-account';

export class TxSubstrate {
  public touchedAccounts: { [address: string]: EvmAccount } = {};
}
