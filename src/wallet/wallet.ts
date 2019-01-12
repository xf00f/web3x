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

import { isNumber } from 'util';
import { Account } from '../account';
import { KeyStore, decrypt } from '../utils/encryption';
import { Address } from '../address';

export class Wallet {
  static readonly defaultKeyName = 'web3js_wallet';
  public length: number = 0;
  public accounts: Account[] = [];

  constructor() {}

  static fromMnemonic(mnemonic: string, numberOfAccounts: number) {
    const wallet = new Wallet();
    for (var i = 0; i < numberOfAccounts; ++i) {
      const path = `m/44'/60'/0'/0/${i}`;
      wallet.add(Account.createFromMnemonicAndPath(mnemonic, path));
    }
    return wallet;
  }

  static fromSeed(seed: Buffer, numberOfAccounts: number) {
    const wallet = new Wallet();
    for (var i = 0; i < numberOfAccounts; ++i) {
      const path = `m/44'/60'/0'/0/${i}`;
      wallet.add(Account.createFromSeedAndPath(seed, path));
    }
    return wallet;
  }

  static async fromKeystores(encryptedWallet: KeyStore[], password: string) {
    const wallet = new Wallet();
    await wallet.decrypt(encryptedWallet, password);
    return wallet;
  }

  static async fromLocalStorage(password: string, keyName: string = this.defaultKeyName) {
    if (!localStorage) {
      return new Wallet();
    }

    const keystoreStr = localStorage.getItem(keyName);

    if (!keystoreStr) {
      return new Wallet();
    }

    try {
      return Wallet.fromKeystores(JSON.parse(keystoreStr), password);
    } catch (e) {
      return new Wallet();
    }
  }

  create(numberOfAccounts: number, entropy?: Buffer): Account[] {
    for (var i = 0; i < numberOfAccounts; ++i) {
      this.add(Account.create(entropy).privateKey);
    }
    return this.accounts;
  }

  get(addressOrIndex: string | number | Address) {
    if (isNumber(addressOrIndex)) {
      return this.accounts[addressOrIndex];
    }
    return this.accounts.find(a => a && a.address.toString().toLowerCase() === addressOrIndex.toString().toLowerCase());
  }

  indexOf(addressOrIndex: string | number | Address) {
    if (isNumber(addressOrIndex)) {
      return addressOrIndex;
    }
    return this.accounts.findIndex(a => a.address.toString().toLowerCase() === addressOrIndex.toString().toLowerCase());
  }

  add(privateKey: Buffer): Account;
  add(account: Account): Account;
  add(accountOrKey: Buffer | Account): Account {
    const account = Buffer.isBuffer(accountOrKey) ? Account.fromPrivate(accountOrKey) : accountOrKey;

    const existing = this.get(account.address);
    if (existing) {
      return existing;
    }

    const index = this.findSafeIndex();
    this.accounts[index] = account;
    this.length++;

    return account;
  }

  remove(addressOrIndex: string | number | Address) {
    const index = this.indexOf(addressOrIndex);

    if (index == -1) {
      return false;
    }

    delete this.accounts[index];
    this.length--;

    return true;
  }

  clear() {
    this.accounts = [];
    this.length = 0;
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

  async save(password: string, keyName: string = Wallet.defaultKeyName) {
    if (!localStorage) {
      return false;
    }

    localStorage.setItem(keyName, JSON.stringify(await this.encrypt(password)));

    return true;
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
}
