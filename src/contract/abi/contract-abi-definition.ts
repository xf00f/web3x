export type AbiDataTypes = 'uint256' | 'boolean' | 'string' | 'bytes' | string;
export type AbiInput = { components?: any; name: string; type: AbiDataTypes; indexed?: boolean };
export type AbiOutput = { components?: any; name: string; type: AbiDataTypes };

export interface ContractEntryDefinition {
  constant?: boolean;
  payable?: boolean;
  anonymous?: boolean;
  inputs?: AbiInput[];
  name?: string;
  outputs?: AbiOutput[];
  type: 'function' | 'constructor' | 'event' | 'fallback';
  stateMutability?: 'pure' | 'view' | 'payable' | 'nonpayable';
}

export type ContractAbiDefinition = ContractEntryDefinition[];
