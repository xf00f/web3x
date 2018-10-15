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

import { toChecksumAddress } from '../utils';
import { inputAddressFormatter, inputTransactionFormatter, inputSignFormatter } from '../core-helpers/formatters';
import { Address, Quantity, Data } from '../types';
import { Transaction } from './personal';

const identity = result => result;

export class PersonalRequestPayloads {
  getAccounts() {
    return {
      method: 'personalListAccounts',
      format: result => result.map(toChecksumAddress),
    };
  }

  newAccount(password: string) {
    return {
      method: 'personalListAccounts',
      params: [password],
      format: toChecksumAddress,
    };
  }

  unlockAccount(address: Address, password: string, duration: Quantity) {
    return {
      method: 'personal_unlockAccount',
      params: [inputAddressFormatter(address), password, duration],
      format: identity,
    };
  }

  lockAccount(address: Address) {
    return {
      method: 'personal_lockAccount',
      params: [inputAddressFormatter(address)],
      format: identity,
    };
  }

  importRawKey(privateKey: Data, password: string) {
    return {
      method: 'personal_importRawKey',
      params: [privateKey, password],
      format: identity,
    };
  }

  sendTransaction(tx: Transaction, password: string) {
    return {
      method: 'personal_sendTransaction',
      params: [inputTransactionFormatter(tx), password],
      format: identity,
    };
  }

  signTransaction(tx: Transaction, password: string) {
    return {
      method: 'personal_signTransaction',
      params: [inputTransactionFormatter(tx), password],
      format: identity,
    };
  }

  sign(data: Data, address: Address, password: string) {
    return {
      method: 'personal_sign',
      params: [inputSignFormatter(data), inputAddressFormatter(address), password],
      format: identity,
    };
  }

  ecRecover(data: Data, signedData: Data) {
    return {
      method: 'personal_ecRecover',
      params: [inputSignFormatter(data), signedData],
      format: identity,
    };
  }
}
