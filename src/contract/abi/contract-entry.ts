import { abiCoder } from '../abi-coder';
import { ContractEntryDefinition } from './contract-abi-definition';

export class ContractEntry {
  constructor(protected entry: ContractEntryDefinition) {}

  public get name() {
    return this.entry.name;
  }

  public asString() {
    return abiCoder.abiMethodToString(this.entry);
  }
}
