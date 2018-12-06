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

import { Wallet } from './wallet';
import { isAddress, hexToBuffer } from '../utils';
import { Account } from '../account';

const tests = [
  {
    address: '0xEB014f8c8B418Db6b45774c326A0E64C78914dC0',
    privateKey: hexToBuffer('0xbe6383dad004f233317e46ddb46ad31b16064d14447a95cc1d8c8d4bc61c3728'),
    data: 'Some data',
    // signature done with personal_sign
    signature:
      '0xa8037a6116c176a25e6fc224947fde9e79a2deaa0dd8b67b366fbdfdbffc01f953e41351267b20d4a89ebfe9c8f03c04de9b345add4a52f15bd026b63c8fb1501b',
  },
  {
    address: '0xEB014f8c8B418Db6b45774c326A0E64C78914dC0',
    privateKey: hexToBuffer('0xbe6383dad004f233317e46ddb46ad31b16064d14447a95cc1d8c8d4bc61c3728'),
    data: 'Some data!%$$%&@*',
    // signature done with personal_sign
    signature:
      '0x05252412b097c5d080c994d1ea12abcee6f1cae23feb225517a0b691a66e12866b3f54292f9cfef98f390670b4d010fc4af7fcd46e41d72870602c117b14921c1c',
  },
];

describe('wallet', function() {
  tests.forEach(function(test, i) {
    it('creates the right number of wallets', function() {
      const wallet = new Wallet();
      expect(wallet.length).toBe(0);

      wallet.create(2, Buffer.from('542342f!@#$$'));
      expect(wallet.length).toBe(2);

      wallet.create(3);
      expect(wallet.length).toBe(5);

      expect(isAddress(wallet.accounts[1].address)).toBe(true);
      expect(isAddress(wallet.accounts[2].address)).toBe(true);
    });

    it('add wallet using a privatekey', function() {
      const wallet = new Wallet();

      const account = wallet.add(test.privateKey);

      expect(account.address).toBe(test.address);
      expect(account.privateKey).toBe(test.privateKey);
      expect(wallet.indexOf(account.address)).toBe(0);

      expect(wallet.get(test.address)!.address).toBe(test.address);
      expect(wallet.get(test.address.toLowerCase())!.address).toBe(test.address);
      expect(wallet.get(0)!.address).toBe(test.address);
      expect(wallet.length).toBe(1);
    });

    it('add wallet using an account', function() {
      const wallet = new Wallet();

      const account = Account.fromPrivate(test.privateKey);
      wallet.add(account);

      expect(account.address).toBe(test.address);
      expect(account.privateKey).toBe(test.privateKey);
      expect(wallet.indexOf(account.address)).toBe(0);

      expect(wallet.get(test.address)!.address).toBe(test.address);
      expect(wallet.get(test.address.toLowerCase())!.address).toBe(test.address);
      expect(wallet.get(0)!.address).toBe(test.address);
      expect(wallet.length).toBe(1);
    });

    it('should not add wallet twice work', function() {
      const wallet = new Wallet();

      const account = Account.fromPrivate(test.privateKey);
      wallet.add(account);
      wallet.add(account);

      expect(account.address).toBe(test.address);
      expect(account.privateKey).toBe(test.privateKey);
      expect(wallet.indexOf(account.address)).toBe(0);

      expect(wallet.get(test.address)!.address).toBe(test.address);
      expect(wallet.get(test.address.toLowerCase())!.address).toBe(test.address);
      expect(wallet.get(0)!.address).toBe(test.address);
      expect(wallet.length).toBe(1);
    });

    it('remove wallet using an index', function() {
      const wallet = new Wallet();

      wallet.add(test.privateKey);
      expect(wallet.length).toBe(1);

      wallet.remove(0);
      expect(wallet.get(test.address)).toBeUndefined();
      expect(wallet.get(test.address.toLowerCase())).toBeUndefined();
      expect(wallet.get(0)).toBeUndefined();
      expect(wallet.length).toBe(0);
    });

    it('remove wallet using an address', function() {
      const wallet = new Wallet();

      wallet.add(test.privateKey);
      expect(wallet.length).toBe(1);

      wallet.remove(test.address);
      expect(wallet.length).toBe(0);
    });

    it('remove wallet using an lowercase address', function() {
      const wallet = new Wallet();

      wallet.add(test.privateKey);
      expect(wallet.length).toBe(1);

      wallet.remove(test.address.toLowerCase());
      expect(wallet.length).toBe(0);
    });

    it('create 5 wallets, remove two, create two more and check for overwrites', function() {
      const count = 5;
      const wallet = new Wallet();
      expect(wallet.length).toBe(0);

      wallet.create(count);
      const initialAddresses = [0, 1, 2, 3, 4].map(n => wallet.get(n)!.address);
      expect(wallet.length).toBe(count);

      wallet.get(2)!.address;
      wallet.get(4)!.address;
      const remainingAddresses = [0, 1, 3];
      const beforeRemoval = remainingAddresses.map(n => wallet.get(n)!.address);

      wallet.remove(2);
      wallet.remove(4);

      expect(wallet.get(2)).toBeUndefined();
      expect(wallet.get(4)).toBeUndefined();

      const afterRemoval = remainingAddresses.map(n => wallet.get(n)!.address);

      expect(wallet.length).toBe(3);

      wallet.create(2);
      expect(isAddress(wallet.accounts[2].address)).toBe(true);
      expect(isAddress(wallet.accounts[4].address)).toBe(true);
      expect(wallet.get(5)).toBeUndefined();

      const afterMoreCreation = remainingAddresses.map(n => wallet.get(n)!.address);
      const newAddresses = [0, 1, 2, 3, 4].map(n => wallet.get(n)!.address);

      // Checks for account overwrites
      expect(wallet.length).toBe(count);
      expect(beforeRemoval).toEqual(afterMoreCreation);
      expect(afterRemoval).toEqual(afterMoreCreation);
      expect(initialAddresses).not.toEqual(newAddresses);
    });

    it('clear wallet', function() {
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
      expect(addressFromKeystore).toBe(addressFromWallet);
    });
  });
});
