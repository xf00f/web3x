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

import { isString } from 'util';
import { Account } from './account';
import { KeyStore, decrypt } from '../utils/encryption';
import { Eth } from '../eth';

export class Wallet {
  public static defaultKeyName = 'web3js_wallet';
  public length: number = 0;
  public accounts: Account[] = [];

  constructor(private eth: Eth) {}

  static async fromKeystores(eth: Eth, encryptedWallet: KeyStore[], password: string) {
    const wallet = new Wallet(eth);
    await wallet.decrypt(encryptedWallet, password);
    return wallet;
  }

  private findSafeIndex(pointer: number = 0) {
    while (this.accounts[pointer]) {
      ++pointer;
    }
    return pointer;
  }

  private currentIndexes() {
    const keys = Object.keys(this.accounts);
    return keys.map(key => +key);
  }

  create(numberOfAccounts: number, entropy?: string): Account[] {
    for (var i = 0; i < numberOfAccounts; ++i) {
      this.add(Account.create(this.eth, entropy).privateKey);
    }
    return this.accounts;
  }

  get(addressOrIndex: string | number) {
    if (isString(addressOrIndex)) {
      return this.accounts.find(a => a && a.address.toLowerCase() === addressOrIndex.toLowerCase());
    }
    return this.accounts[addressOrIndex];
  }

  indexOf(addressOrIndex: string | number) {
    if (isString(addressOrIndex)) {
      return this.accounts.findIndex(a => a.address.toLowerCase() === addressOrIndex.toLowerCase());
    }
    return addressOrIndex;
  }

  add(privateKey: string): Account;
  add(account: Account): Account;
  add(account: string | Account): Account {
    if (isString(account)) {
      account = Account.fromPrivate(this.eth, account);
    } else {
      account = Account.fromPrivate(this.eth, account.privateKey);
    }

    const existing = this.get(account.address);
    if (existing) {
      return existing;
    }

    const index = this.findSafeIndex();
    this.accounts[index] = account;
    this.length++;

    return account;
  }

  remove(addressOrIndex: string | number) {
    const index = this.indexOf(addressOrIndex);

    if (index == -1) {
      return false;
    }

    this.accounts[index].privateKey = '';
    delete this.accounts[index];
    this.length--;

    return true;
  }

  clear() {
    var indexes = this.currentIndexes();

    indexes.forEach(index => {
      this.remove(index);
    });
  }

  encrypt(password: string, options?) {
    return Promise.all(this.currentIndexes().map(index => this.accounts[index].encrypt(password, options)));
  }

  async decrypt(encryptedWallet: KeyStore[], password: string) {
    const decrypted = await Promise.all(encryptedWallet.map(keystore => decrypt(keystore, password)));
    decrypted.forEach(account => {
      if (!account) {
        throw new Error("Couldn't decrypt accounts. Password wrong?");
      }

      this.add(account);
    });

    return this.accounts;
  }

  save(password: string, keyName: string = Wallet.defaultKeyName) {
    if (!localStorage) {
      return false;
    }

    localStorage.setItem(keyName, JSON.stringify(this.encrypt(password)));

    return true;
  }

  load(password: string, keyName: string = Wallet.defaultKeyName) {
    if (!localStorage) {
      return [];
    }

    const keystoreStr = localStorage.getItem(keyName);
    let keystore: KeyStore[] = [];

    if (keystoreStr) {
      try {
        keystore = JSON.parse(keystoreStr);
      } catch (e) {}
    }

    return this.decrypt(keystore, password);
  }
}
