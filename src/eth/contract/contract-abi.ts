export type ContractAbi = AbiDefinition[];

export interface AbiDefinition {
  constant?: boolean;
  payable?: boolean;
  anonymous?: boolean;
  inputs?: Array<{ components?: any; name: string; type: AbiDataTypes; indexed?: boolean }>;
  name?: string;
  outputs?: Array<{ components?: any; name: string; type: AbiDataTypes }>;
  type: 'function' | 'constructor' | 'event' | 'fallback';
  stateMutability?: 'pure' | 'view' | 'payable' | 'nonpayable';
  signature?: string;
}

type AbiDataTypes = 'uint256' | 'boolean' | 'string' | 'bytes' | string;
