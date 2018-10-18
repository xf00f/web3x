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

import { KeyStore, sign, recover, Signature } from '../utils';
import { Tx } from '../types';
import { Wallet } from './wallet';
import { Account } from './account';
import { recoverTransaction, signTransaction } from './sign-transaction';
import { Eth } from '../eth';

export class Accounts {
  public wallet: Wallet;

  constructor(private eth: Eth) {
    this.wallet = new Wallet(eth);
  }

  create(entropy?: string): Account {
    return Account.create(this.eth, entropy);
  }

  privateKeyToAccount(privateKey: string): Account {
    return Account.fromPrivate(this.eth, privateKey);
  }

  signTransaction(tx: Tx, privateKey: string) {
    return signTransaction(tx, privateKey, this.eth);
  }

  recoverTransaction(rawTx: string): string {
    return recoverTransaction(rawTx);
  }

  sign(data: string, privateKey: string): Signature {
    return sign(data, privateKey);
  }

  recover(signature: Signature): string;
  recover(message: string, v: string, r: string, s: string, prefixed?: boolean): string;
  recover(message: string, signature: string, preFixed?: boolean);
  recover(...args: any[]): string {
    return recover.apply(null, args);
  }

  async decrypt(v3Keystore: KeyStore | string, password: string, nonStrict: boolean = false) {
    return await Account.fromKeystore(this.eth, v3Keystore, password, nonStrict);
  }

  async encrypt(privateKey: string, password: string, options?: any) {
    return Account.fromPrivate(this.eth, privateKey).encrypt(password, options);
  }
}
