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
import { inputSignFormatter, toRawTransactionRequest, TransactionRequest } from '../formatters';
import { bufferToHex } from '../utils';

export interface Transaction extends TransactionRequest {
  condition?: { block: number } | { time: number } | null;
}

export interface SignedTransaction {
  raw: string;
  tx: Transaction;
}

const identity = <T>() => (result: T) => result;

export class PersonalRequestPayloads {
  public getAccounts() {
    return {
      method: 'personal_listAccounts',
      format: (result: string[]) => result.map(Address.fromString),
    };
  }

  public newAccount(password: string) {
    return {
      method: 'personal_newAccount',
      params: [password],
      format: Address.fromString,
    };
  }

  public unlockAccount(address: Address, password: string, duration: number) {
    return {
      method: 'personal_unlockAccount',
      params: [address.toString().toLowerCase(), password, duration],
      format: identity<boolean>(),
    };
  }

  public lockAccount(address: Address) {
    return {
      method: 'personal_lockAccount',
      params: [address.toString().toLowerCase()],
      format: identity<void>(),
    };
  }

  public importRawKey(privateKey: Buffer, password: string) {
    return {
      method: 'personal_importRawKey',
      params: [bufferToHex(privateKey), password],
      format: Address.fromString,
    };
  }

  public sendTransaction(tx: Transaction, password: string) {
    return {
      method: 'personal_sendTransaction',
      params: [{ ...toRawTransactionRequest(tx), condition: tx.condition }, password],
      format: identity<string>(),
    };
  }

  public signTransaction(tx: Transaction, password: string) {
    return {
      method: 'personal_signTransaction',
      params: [{ ...toRawTransactionRequest(tx), condition: tx.condition }, password],
      format: identity<SignedTransaction>(),
    };
  }

  public sign(message: string, address: Address, password: string) {
    return {
      method: 'personal_sign',
      params: [inputSignFormatter(message), address.toString().toLowerCase(), password],
      format: identity<string>(),
    };
  }

  public ecRecover(message: string, signedData: string) {
    return {
      method: 'personal_ecRecover',
      params: [inputSignFormatter(message), signedData],
      format: Address.fromString,
    };
  }
}
