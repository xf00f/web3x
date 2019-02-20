/*
  This file is part of web3x.

  web3x is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  web3x is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License
  along with web3x.  If not, see <http://www.gnu.org/licenses/>.
*/

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
  signature?: string;
}

export type ContractAbiDefinition = ContractEntryDefinition[];
