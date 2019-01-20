import { Address } from '../../address';
import { WorldState } from '../world';

// YP 7. Contract Creation
interface ContractCreationParams {
  worldState: WorldState;
  sender: Address;
  originalTransactor: Address;
  availableGas: bigint;
  gasPrice: bigint;
  endowment: bigint;
  initialisationCode: Buffer;
  stackDepth: number;
  permission: any;
}

interface TransactionSubstrate {
  selfDesctuctSet: Address[];
  logSeries: any[];
  touchedAccounts: Address[];
  refundBalance: bigint;
}

interface ContractCreationOutput {
  worldState: WorldState;
  remainingGas: bigint;
  txSubstrate: TransactionSubstrate;
  error: Error;
}
