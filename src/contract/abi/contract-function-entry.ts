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

import { bufferToHex, hexToBuffer } from '../../utils';
import { abiCoder } from '../abi-coder';
import { ContractEntryDefinition } from './contract-abi-definition';
import { ContractEntry } from './contract-entry';

export class ContractFunctionEntry extends ContractEntry {
  public readonly signature: string;

  constructor(entry: ContractEntryDefinition) {
    entry.inputs = entry.inputs || [];
    super(entry);
    this.signature =
      entry.type === 'constructor'
        ? 'constructor'
        : abiCoder.encodeFunctionSignature(abiCoder.abiMethodToString(entry));
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
    return Buffer.concat([hexToBuffer(this.signature), this.encodeParameters(args)]);
  }

  public encodeParameters(args: any[]) {
    return hexToBuffer(abiCoder.encodeParameters(this.entry.inputs, args));
  }

  public decodeParameters(bytes: Buffer) {
    return abiCoder.decodeParameters(this.entry.inputs, bufferToHex(bytes));
  }
}
