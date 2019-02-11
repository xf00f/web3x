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
import { Address } from '../address';
import { decrypt, KeyStore } from '../utils/encryption';

const DEFAULT_KEY_NAME = 'web3js_wallet';

export class Wallet {
  public length: number = 0;
  public accounts: Account[] = [];

  constructor(numberOfAccounts: number = 0) {
    this.create(numberOfAccounts);
  }

  public static fromMnemonic(mnemonic: string, numberOfAccounts: number) {
    const wallet = new Wallet();
    for (let i = 0; i < numberOfAccounts; ++i) {
      const path = `m/44'/60'/0'/0/${i}`;
      wallet.add(Account.createFromMnemonicAndPath(mnemonic, path));
    }
    return wallet;
  }

  public static fromSeed(seed: Buffer, numberOfAccounts: number) {
    const wallet = new Wallet();
    for (let i = 0; i < numberOfAccounts; ++i) {
      const path = `m/44'/60'/0'/0/${i}`;
      wallet.add(Account.createFromSeedAndPath(seed, path));
    }
    return wallet;
  }

  public static async fromKeystores(encryptedWallet: KeyStore[], password: string) {
    const wallet = new Wallet();
    await wallet.decrypt(encryptedWallet, password);
    return wallet;
  }

  public static async fromLocalStorage(password: string, keyName: string = DEFAULT_KEY_NAME) {
    if (!localStorage) {
      return;
    }

    const keystoreStr = localStorage.getItem(keyName);

    if (!keystoreStr) {
      return;
    }

    try {
      return Wallet.fromKeystores(JSON.parse(keystoreStr), password);
    } catch (e) {
      return;
    }
  }

  public create(numberOfAccounts: number, entropy?: Buffer): Account[] {
    for (let i = 0; i < numberOfAccounts; ++i) {
      this.add(Account.create(entropy).privateKey);
    }
    return this.accounts;
  }

  public get(addressOrIndex: string | number | Address) {
    if (isNumber(addressOrIndex)) {
      return this.accounts[addressOrIndex];
    }
    return this.accounts.find(a => a && a.address.toString().toLowerCase() === addressOrIndex.toString().toLowerCase());
  }

  public indexOf(addressOrIndex: string | number | Address) {
    if (isNumber(addressOrIndex)) {
      return addressOrIndex;
    }
    return this.accounts.findIndex(a => a.address.toString().toLowerCase() === addressOrIndex.toString().toLowerCase());
  }

  public add(accountOrKey: Buffer | Account): Account {
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

  public remove(addressOrIndex: string | number | Address) {
    const index = this.indexOf(addressOrIndex);

    if (index === -1) {
      return false;
    }

    delete this.accounts[index];
    this.length--;

    return true;
  }

  public clear() {
    this.accounts = [];
    this.length = 0;
  }

  public encrypt(password: string, options?) {
    return Promise.all(this.currentIndexes().map(index => this.accounts[index].encrypt(password, options)));
  }

  public async decrypt(encryptedWallet: KeyStore[], password: string) {
    const decrypted = await Promise.all(encryptedWallet.map(keystore => decrypt(keystore, password)));
    decrypted.forEach(account => {
      if (!account) {
        throw new Error("Couldn't decrypt accounts. Password wrong?");
      }

      this.add(account);
    });

    return this.accounts;
  }

  public async saveToLocalStorage(password: string, keyName: string = DEFAULT_KEY_NAME) {
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

  public currentIndexes() {
    return Object.keys(this.accounts).map(key => +key);
  }

  public currentAddresses() {
    return Object.entries(this.accounts).map(([, account]) => account.address);
  }
}
