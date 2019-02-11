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
import { bufferToHex, hexToBuffer, recover } from '../utils';
import { Account } from './account';

describe('account', () => {
  it('should create account', () => {
    const account = Account.create();
    expect(account).toBeInstanceOf(Account);
  });

  it('should create account from private key', () => {
    const privateKey = Buffer.from('7a28b5ba57c53603b0b07b56bba752f7784bf506fa95edc395f5cf6c7514fe9d', 'hex');
    const account = Account.fromPrivate(privateKey);
    expect(account.address.toString()).toBe('0x008AeEda4D805471dF9b2A5B0f38A0C3bCBA786b');
  });

  it('should create account from mnemonic and path', () => {
    const mnemonic = 'uncover parade truck rhythm cinnamon cattle polar luxury chest anchor cinnamon coil';
    const path = "m/44'/60'/0'/0/0";
    const account = Account.createFromMnemonicAndPath(mnemonic, path);
    expect(account.address.toString()).toBe('0xb897DF5d6c6D5b15E7340D7Ea2A8B8dC776B43F4');
    expect(bufferToHex(account.privateKey)).toBe('0xdc21e91bcb468f2c2484f44f947f38625b441366f9afe82cda6f3d9de0135c3b');
  });

  it('should encrypt and decrypt account', async () => {
    const account = Account.create();
    const keyStore = await account.encrypt('password');
    const decrypted = await Account.fromKeystore(keyStore, 'password');
    expect(decrypted.address).toEqual(account.address);
    expect(decrypted.privateKey).toEqual(account.privateKey);
  });

  it('should sign data', async () => {
    const privateKey = Buffer.from('7a28b5ba57c53603b0b07b56bba752f7784bf506fa95edc395f5cf6c7514fe9d', 'hex');
    const account = Account.fromPrivate(privateKey);
    const signedData = account.sign('data to sign');
    const address = recover(signedData);
    expect(address).toEqual(account.address);
  });

  it('should sign transaction', async () => {
    const mockEthereum: any = undefined;
    const privateKey = hexToBuffer('0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318');
    const tx = {
      chainId: 1,
      nonce: 0,
      gasPrice: '20000000000',
      gas: 21000,
      to: Address.fromString('0xF0109fC8DF283027b6285cc889F5aA624EaC1F55'),
      value: '1000000000',
    };

    const testAccount = Account.fromPrivate(privateKey);
    const signedTx = await testAccount.signTransaction(tx, mockEthereum);

    expect(signedTx.rawTransaction).toBe(
      '0xf868808504a817c80082520894f0109fc8df283027b6285cc889f5aa624eac1f55843b9aca008026a0afa02d193471bb974081585daabf8a751d4decbb519604ac7df612cc11e9226da04bf1bd55e82cebb2b09ed39bbffe35107ea611fa212c2d9a1f1ada4952077118',
    );
  });

  it('should send transaction', async () => {
    const mockEthereum = {
      getTransactionReceipt: jest.fn(),
      sendSignedTransaction: jest.fn(),
    };

    const tx = {
      chainId: 1,
      nonce: 0,
      gasPrice: '20000000000',
      gas: 21000,
      to: Address.fromString('0xF0109fC8DF283027b6285cc889F5aA624EaC1F55'),
      value: '1000000000',
    };
    const testAccount = Account.create();

    mockEthereum.sendSignedTransaction.mockReturnValue({
      getTxHash: jest.fn().mockResolvedValue('0x1234'),
    });

    mockEthereum.getTransactionReceipt.mockResolvedValue({});

    await testAccount.sendTransaction(tx, mockEthereum as any).getReceipt();

    expect(mockEthereum.sendSignedTransaction).toHaveBeenCalled();
  });

  it('should throw error if sending bad transaction', async () => {
    const mockEthereum = {};
    const tx = {
      chainId: 1,
      nonce: 0,
      gasPrice: '20000000000',
      gas: 0,
      to: Address.fromString('0xF0109fC8DF283027b6285cc889F5aA624EaC1F55'),
      value: '1000000000',
    };
    const testAccount = Account.create();

    await expect(testAccount.sendTransaction(tx, mockEthereum as any).getReceipt()).rejects.toThrowError('gas');
  });
});
