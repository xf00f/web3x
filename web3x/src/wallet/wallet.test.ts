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

import { Account } from '../account';
import { Address } from '../address';
import { hexToBuffer } from '../utils';
import { Wallet } from './wallet';

describe('wallet', () => {
  const address = Address.fromString('0xEB014f8c8B418Db6b45774c326A0E64C78914dC0');
  const privateKey = hexToBuffer('0xbe6383dad004f233317e46ddb46ad31b16064d14447a95cc1d8c8d4bc61c3728');

  it('creates the right number of wallets', () => {
    const wallet = new Wallet();
    expect(wallet.length).toBe(0);

    wallet.create(2, Buffer.from('542342f!@#$$'));
    expect(wallet.length).toBe(2);

    wallet.create(3);
    expect(wallet.length).toBe(5);

    expect(Address.isAddress(wallet.accounts[1].address.toString())).toBe(true);
    expect(Address.isAddress(wallet.accounts[2].address.toString())).toBe(true);
  });

  it('add wallet using a privatekey', () => {
    const wallet = new Wallet();

    const account = wallet.add(privateKey);

    expect(account.address).toEqual(address);
    expect(account.privateKey).toEqual(privateKey);
    expect(wallet.indexOf(account.address)).toBe(0);

    expect(wallet.get(address)!.address).toEqual(address);
    expect(wallet.get(0)!.address).toEqual(address);
    expect(wallet.length).toBe(1);
  });

  it('add wallet using an account', () => {
    const wallet = new Wallet();

    const account = Account.fromPrivate(privateKey);
    wallet.add(account);

    expect(account.address).toEqual(address);
    expect(account.privateKey).toEqual(privateKey);
    expect(wallet.indexOf(account.address)).toBe(0);

    expect(wallet.get(address)!.address).toEqual(address);
    expect(wallet.get(0)!.address).toEqual(address);
    expect(wallet.length).toBe(1);
  });

  it('should not add wallet twice work', () => {
    const wallet = new Wallet();

    const account = Account.fromPrivate(privateKey);
    wallet.add(account);
    wallet.add(account);

    expect(account.address).toEqual(address);
    expect(account.privateKey).toEqual(privateKey);
    expect(wallet.indexOf(account.address)).toBe(0);

    expect(wallet.get(address)!.address).toEqual(address);
    expect(wallet.get(0)!.address).toEqual(address);
    expect(wallet.length).toBe(1);
  });

  it('remove wallet using an index', () => {
    const wallet = new Wallet();

    wallet.add(privateKey);
    expect(wallet.length).toBe(1);

    wallet.remove(0);
    expect(wallet.get(address)).toBeUndefined();
    expect(wallet.get(0)).toBeUndefined();
    expect(wallet.length).toBe(0);
  });

  it('remove wallet using an address', () => {
    const wallet = new Wallet();

    wallet.add(privateKey);
    expect(wallet.length).toBe(1);

    wallet.remove(address);
    expect(wallet.length).toBe(0);
  });

  it('remove wallet using an lowercase address', () => {
    const wallet = new Wallet();

    wallet.add(privateKey);
    expect(wallet.length).toBe(1);

    wallet.remove(address.toString().toLowerCase());
    expect(wallet.length).toBe(0);
  });

  it('create 5 wallets, remove two, create two more and check for overwrites', () => {
    const count = 5;
    const wallet = new Wallet();
    expect(wallet.length).toBe(0);

    wallet.create(count);
    const initialAddresses = [0, 1, 2, 3, 4].map(n => wallet.get(n)!.address);
    expect(wallet.length).toBe(count);

    const remainingAddresses = [0, 1, 3];
    const beforeRemoval = remainingAddresses.map(n => wallet.get(n)!.address);

    wallet.remove(2);
    wallet.remove(4);

    expect(wallet.get(2)).toBeUndefined();
    expect(wallet.get(4)).toBeUndefined();

    const afterRemoval = remainingAddresses.map(n => wallet.get(n)!.address);

    expect(wallet.length).toBe(3);

    wallet.create(2);
    expect(Address.isAddress(wallet.accounts[2].address.toString())).toBe(true);
    expect(Address.isAddress(wallet.accounts[4].address.toString())).toBe(true);
    expect(wallet.get(5)).toBeUndefined();

    const afterMoreCreation = remainingAddresses.map(n => wallet.get(n)!.address);
    const newAddresses = [0, 1, 2, 3, 4].map(n => wallet.get(n)!.address);

    // Checks for account overwrites
    expect(wallet.length).toBe(count);
    expect(beforeRemoval).toEqual(afterMoreCreation);
    expect(afterRemoval).toEqual(afterMoreCreation);
    expect(initialAddresses).not.toEqual(newAddresses);
  });

  it('clear wallet', () => {
    const count = 10;
    const wallet = new Wallet();

    wallet.create(count);
    expect(wallet.length).toBe(10);

    wallet.clear();

    for (let i = 0; i < count; i++) {
      expect(wallet.get(i)).toBeUndefined();
    }
    expect(wallet.length).toBe(0);
  });

  it('encrypt then decrypt wallet', async () => {
    const wallet = new Wallet();
    const password = 'qwerty';

    wallet.create(5);
    const addressFromWallet = wallet.accounts[0].address;
    expect(wallet.length).toBe(5);

    wallet.remove(2);
    expect(wallet.length).toBe(4);

    const keystore = await wallet.encrypt(password);
    expect(wallet.length).toBe(4);

    wallet.clear();
    expect(wallet.length).toBe(0);

    await wallet.decrypt(keystore, password);
    expect(wallet.length).toBe(4);

    const addressFromKeystore = wallet.accounts[0].address;
    expect(addressFromKeystore).toEqual(addressFromWallet);
  }, 30000);

  it('should create correct accounts from mnemonic', () => {
    const mnemonic = 'profit gather crucial census birth effort clinic roast harvest rebuild hidden bamboo';
    const addresses = [
      '0xa97ab6ec66bc2354a7d880bae18fea633752ca85',
      '0x7048779748e8899c8f8baa9dd6c8973411d0fa17',
      '0xe8d62adfc3584a444546f17cd1bb3c327767edb0',
      '0x951afb198aaa10702f456bcc61aa8f59c4f17a2f',
      '0x0598ce5f520574b5b8bd9651971c7767e4354189',
      '0xa2e8c16c765ab30900e205a7ea240df7cbe63548',
      '0x107d4df66df086faaa66690fadd5d3ed1ca630d1',
      '0x070b4ed7bee40216355cf84d88a7ab2696caf373',
      '0x87fa6ff918e36b7b73ed99c1ae5e7c3d63edb44b',
      '0xc174aec38d282396604130e65b59d0096ca53fd7',
    ];

    const wallet = Wallet.fromMnemonic(mnemonic, 10);

    expect(wallet.accounts.map(a => a.address.toString().toLowerCase())).toEqual(addresses);

    addresses.forEach((address, i) => {
      expect(
        wallet
          .get(i)!
          .address.toString()
          .toLowerCase(),
      ).toBe(address);
    });
  });
});
