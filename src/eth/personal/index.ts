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

import { Method } from '../../core-method';
import { IRequestManager } from '../../core-request-manager';
import { toChecksumAddress } from '../../utils';
import { inputAddressFormatter, inputTransactionFormatter, inputSignFormatter } from '../../core-helpers/formatters';
import { BlockType } from '../../types';

type Address = string;
type TransactionHash = string;
type Quantity = number | string;
type Data = string;

interface Transaction {
  from: Address;
  to?: Address;
  gas?: Quantity;
  gasPrice?: Quantity;
  value?: Quantity;
  data?: Data;
  nonce?: Quantity;
  condition?: { block: number } | { time: number } | null;
}

interface SignedTransaction {
  raw: Data;
  tx: Transaction;
}

export class Personal {
  constructor(
    private requestManager: IRequestManager,
    private defaultAccount?: string,
    private defaultBlock: BlockType = 'latest',
  ) {
    if (this.defaultAccount) {
      this.defaultAccount = toChecksumAddress(inputAddressFormatter(this.defaultAccount));
    }
  }

  getAccounts(): Promise<Address[]> {
    const method = new Method({
      name: 'getAccounts',
      call: 'personal_listAccounts',
      params: 0,
      outputFormatter: toChecksumAddress,
      defaultAccount: this.defaultAccount,
      defaultBlock: this.defaultBlock,
      requestManager: this.requestManager,
    }).createFunction();

    return method();
  }

  newAccount(password: string): Promise<Address> {
    const method = new Method({
      name: 'newAccount',
      call: 'personal_newAccount',
      params: 1,
      inputFormatter: [null],
      outputFormatter: toChecksumAddress,
      defaultAccount: this.defaultAccount,
      defaultBlock: this.defaultBlock,
      requestManager: this.requestManager,
    }).createFunction();

    return method(password);
  }

  unlockAccount(address: Address, password: string, duration: Quantity): Promise<boolean> {
    const method = new Method({
      name: 'unlockAccount',
      call: 'personal_unlockAccount',
      params: 3,
      inputFormatter: [inputAddressFormatter, null, null],
      defaultAccount: this.defaultAccount,
      defaultBlock: this.defaultBlock,
      requestManager: this.requestManager,
    }).createFunction();

    return method(address, password, duration);
  }

  lockAccount(address: Address) {
    const method = new Method({
      name: 'lockAccount',
      call: 'personal_lockAccount',
      params: 1,
      inputFormatter: [inputAddressFormatter],
      defaultAccount: this.defaultAccount,
      defaultBlock: this.defaultBlock,
      requestManager: this.requestManager,
    }).createFunction();

    return method(address);
  }

  importRawKey(privateKey: Data, password: string): Promise<Address> {
    const method = new Method({
      name: 'importRawKey',
      call: 'personal_importRawKey',
      params: 2,
      defaultAccount: this.defaultAccount,
      defaultBlock: this.defaultBlock,
      requestManager: this.requestManager,
    }).createFunction();

    return method(privateKey, password);
  }

  sendTransaction(tx: Transaction, password: string): Promise<TransactionHash> {
    const method = new Method({
      name: 'sendTransaction',
      call: 'personal_sendTransaction',
      params: 2,
      inputFormatter: [inputTransactionFormatter, null],
      defaultAccount: this.defaultAccount,
      defaultBlock: this.defaultBlock,
      requestManager: this.requestManager,
    }).createFunction();

    return method(tx, password);
  }

  signTransaction(tx: Transaction, password: string): Promise<SignedTransaction> {
    const method = new Method({
      name: 'signTransaction',
      call: 'personal_signTransaction',
      params: 2,
      inputFormatter: [inputTransactionFormatter, null],
      defaultAccount: this.defaultAccount,
      defaultBlock: this.defaultBlock,
      requestManager: this.requestManager,
    }).createFunction();

    return method(tx, password);
  }

  sign(data: Data, address: Address, password: string): Promise<Data> {
    const method = new Method({
      name: 'sign',
      call: 'personal_sign',
      params: 3,
      inputFormatter: [inputSignFormatter, inputAddressFormatter, null],
      defaultAccount: this.defaultAccount,
      defaultBlock: this.defaultBlock,
      requestManager: this.requestManager,
    }).createFunction();

    return method(data, address, password);
  }

  ecRecover(data: Data, signedData: Data): Promise<Address> {
    const method = new Method({
      name: 'ecRecover',
      call: 'personal_ecRecover',
      params: 2,
      inputFormatter: [inputSignFormatter, null],
      defaultAccount: this.defaultAccount,
      defaultBlock: this.defaultBlock,
      requestManager: this.requestManager,
    }).createFunction();

    return method(data, signedData);
  }
}
