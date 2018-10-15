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

import { Tx } from '../types';
import { create, fromPrivate } from '../eth-lib/account';
import { randomHex, encrypt, KeyStore, decrypt } from '../utils';
import { sign } from '../utils/sign';
import { signTransaction } from './sign-transaction';
import { Eth } from '../eth';

export class Account {
  constructor(public address: string, public privateKey: string, public publicKey) {}

  static create(entropy: string = randomHex(32)) {
    const { privateKey, address, publicKey } = create(entropy);
    return new Account(address, privateKey, publicKey);
  }

  static fromPrivate(privateKey: string) {
    const { address, publicKey } = fromPrivate(privateKey);
    return new Account(address, privateKey, publicKey);
  }

  static async fromKeystore(v3Keystore: KeyStore | string, password: string, nonStrict = false) {
    return Account.fromPrivate(await decrypt(v3Keystore, password, nonStrict));
  }

  signTransaction(tx: Tx, eth: Eth) {
    return signTransaction(tx, this.privateKey, eth);
  }

  sign(data: string) {
    return sign(data, this.privateKey);
  }

  encrypt(password: string, options?: any) {
    return encrypt(this.privateKey, this.address, password, options);
  }
}
