import { abiCoder } from '../abi-coder';
import { ContractEntryDefinition } from './contract-abi-definition';
import { ContractEntry } from './contract-entry';

export class ContractFunctionEntry extends ContractEntry {
  public readonly signature: string;

  constructor(entry: ContractEntryDefinition) {
    super(entry);
    this.signature = abiCoder.encodeFunctionSignature(abiCoder.abiMethodToString(entry));
  }

  public get constant() {
    return this.entry.stateMutability === 'view' || this.entry.stateMutability === 'pure' || this.entry.constant;
  }

  public get payable() {
    return this.entry.stateMutability === 'payable' || this.entry.payable;
  }

  public numArgs() {
    return this.entry.inputs ? this.entry.inputs.length : 0;
  }

  public decodeReturnValue(returnValue: string) {
    if (!returnValue) {
      return null;
    }

    const result = abiCoder.decodeParameters(this.entry.outputs, returnValue);

    if (result.__length__ === 1) {
      return result[0];
    } else {
      delete result.__length__;
      return result;
    }
  }

  public encodeABI(args: any[]) {
    return this.signature + this.encodeParameters(args).replace('0x', '');
  }

  public encodeParameters(args: any[]) {
    return abiCoder.encodeParameters(this.entry.inputs || [], args);
  }
}
