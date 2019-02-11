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

import { Address } from '../address';
import { inputSignFormatter, toRawTransactionRequest } from '../formatters';
import { Data, Quantity } from '../types';
import { Transaction } from './personal';

const identity = result => result;

export class PersonalRequestPayloads {
  public getAccounts() {
    return {
      method: 'personalListAccounts',
      format: result => result.map(Address.fromString),
    };
  }

  public newAccount(password: string) {
    return {
      method: 'personalListAccounts',
      params: [password],
      format: Address.fromString,
    };
  }

  public unlockAccount(address: Address, password: string, duration: Quantity) {
    return {
      method: 'personal_unlockAccount',
      params: [address, password, duration],
      format: identity,
    };
  }

  public lockAccount(address: Address) {
    return {
      method: 'personal_lockAccount',
      params: [address],
      format: identity,
    };
  }

  public importRawKey(privateKey: Data, password: string) {
    return {
      method: 'personal_importRawKey',
      params: [privateKey, password],
      format: identity,
    };
  }

  public sendTransaction(tx: Transaction, password: string) {
    return {
      method: 'personal_sendTransaction',
      params: [{ ...toRawTransactionRequest(tx), condition: tx.condition }, password],
      format: identity,
    };
  }

  public signTransaction(tx: Transaction, password: string) {
    return {
      method: 'personal_signTransaction',
      params: [{ ...toRawTransactionRequest(tx), condition: tx.condition }, password],
      format: identity,
    };
  }

  public sign(data: Data, address: Address, password: string) {
    return {
      method: 'personal_sign',
      params: [inputSignFormatter(data), address, password],
      format: identity,
    };
  }

  public ecRecover(data: Data, signedData: Data) {
    return {
      method: 'personal_ecRecover',
      params: [inputSignFormatter(data), signedData],
      format: identity,
    };
  }
}
