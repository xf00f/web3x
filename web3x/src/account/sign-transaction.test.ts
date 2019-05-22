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
import { hexToBuffer } from '../utils';
import { recoverTransaction, signTransaction } from './sign-transaction';

describe('account', () => {
  describe('sign-transaction', () => {
    let mockEthereum;

    const testData = {
      address: '0x2c7536E3605D9C16a7a3D7b1898e529396a65c23',
      iban: 'XE0556YCRTEZ9JALZBSCXOK4UJ5F3HN03DV',
      privateKey: hexToBuffer('0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318'),
      transaction: {
        chainId: 1,
        nonce: 0,
        gasPrice: '20000000000',
        gas: 21000,
        to: Address.fromString('0xF0109fC8DF283027b6285cc889F5aA624EaC1F55'),
        value: '1000000000',
      },
      rawTransaction:
        '0xf868808504a817c80082520894f0109fc8df283027b6285cc889f5aa624eac1f55843b9aca008026a0afa02d193471bb974081585daabf8a751d4decbb519604ac7df612cc11e9226da04bf1bd55e82cebb2b09ed39bbffe35107ea611fa212c2d9a1f1ada4952077118',
    };

    beforeEach(() => {
      mockEthereum = {
        getId: jest.fn(),
        getGasPrice: jest.fn(),
        getTransactionCount: jest.fn(),
      };
    });

    it('should throw if fails to get chainId', async () => {
      const privateKey = hexToBuffer('0xbe6383dad004f233317e46ddb46ad31b16064d14447a95cc1d8c8d4bc61c3728');
      const tx = {
        nonce: 0,
        gasPrice: '230000000000',
        gas: 50000,
      };
      await expect(signTransaction(tx, privateKey, mockEthereum)).rejects.toThrowError('One of the values chainId');
    });

    it('should throw if gas is zero', async () => {
      const privateKey = hexToBuffer('0xbe6383dad004f233317e46ddb46ad31b16064d14447a95cc1d8c8d4bc61c3728');
      const tx = { gas: 0 };
      await expect(signTransaction(tx, privateKey, mockEthereum)).rejects.toThrowError('gas is missing or 0');
    });

    it('signTransaction using the iban as "to" must compare to eth_signTransaction', async () => {
      const transaction = {
        ...testData.transaction,
        to: 'XE04S1IRT2PR8A8422TPBL9SR6U0HODDCUT' as any,
      };
      const tx = await signTransaction(transaction, testData.privateKey, mockEthereum);
      expect(tx.rawTransaction).toBe(testData.rawTransaction);
    });

    it('should call for nonce', async () => {
      const { nonce, ...transaction } = testData.transaction;
      mockEthereum.getTransactionCount.mockResolvedValue(nonce);
      const tx = await signTransaction(transaction, testData.privateKey, mockEthereum);
      expect(tx.rawTransaction).toBe(testData.rawTransaction);
      expect(mockEthereum.getTransactionCount).toHaveBeenCalledTimes(1);
    });

    it('should call for gasPrice', async () => {
      const { gasPrice, ...transaction } = testData.transaction;
      mockEthereum.getGasPrice.mockResolvedValue(gasPrice);
      const tx = await signTransaction(transaction, testData.privateKey, mockEthereum);
      expect(tx.rawTransaction).toBe(testData.rawTransaction);
      expect(mockEthereum.getGasPrice).toHaveBeenCalledTimes(1);
    });

    it('should call for chainId', async () => {
      const { chainId, ...transaction } = testData.transaction;
      mockEthereum.getId.mockResolvedValue(chainId);
      const tx = await signTransaction(transaction, testData.privateKey, mockEthereum);
      expect(tx.rawTransaction).toBe(testData.rawTransaction);
      expect(mockEthereum.getId).toHaveBeenCalledTimes(1);
    });

    it('should call for nonce, gasPrice and chainId', async () => {
      const { nonce, gasPrice, chainId, ...transaction } = testData.transaction;
      mockEthereum.getTransactionCount.mockResolvedValue(nonce);
      mockEthereum.getGasPrice.mockResolvedValue(gasPrice);
      mockEthereum.getId.mockResolvedValue(chainId);
      const tx = await signTransaction(transaction, testData.privateKey, mockEthereum);
      expect(tx.rawTransaction).toBe(testData.rawTransaction);
      expect(mockEthereum.getId).toHaveBeenCalledTimes(1);
      expect(mockEthereum.getGasPrice).toHaveBeenCalledTimes(1);
      expect(mockEthereum.getTransactionCount).toHaveBeenCalledTimes(1);
    });

    it('should error with negative gasPrice', async () => {
      const transaction = {
        ...testData.transaction,
        gasPrice: -10,
      };
      await expect(signTransaction(transaction, testData.privateKey, mockEthereum)).rejects.toBeInstanceOf(Error);
    });

    it('should error with negative chainId', async () => {
      const transaction = {
        ...testData.transaction,
        chainId: -1,
      };
      await expect(signTransaction(transaction, testData.privateKey, mockEthereum)).rejects.toBeInstanceOf(Error);
    });

    it('should error with negative gas', async () => {
      const transaction = {
        ...testData.transaction,
        gas: -1,
      };
      await expect(signTransaction(transaction, testData.privateKey, mockEthereum)).rejects.toBeInstanceOf(Error);
    });

    it('should error with negative nonce', async () => {
      const transaction = {
        ...testData.transaction,
        nonce: -1,
      };
      await expect(signTransaction(transaction, testData.privateKey, mockEthereum)).rejects.toBeInstanceOf(Error);
    });

    it('should create correct signature', async () => {
      const tx = await signTransaction(testData.transaction, testData.privateKey, mockEthereum);
      expect(tx.messageHash).toBe('0x2c7903a33b55caf582d170f21595f1a7e598df3fa61b103ea0cd9d6b2a92565d');
      expect(tx.rawTransaction).toBe(testData.rawTransaction);
    });

    it('should recover address from signature', async () => {
      const tx = await signTransaction(testData.transaction, testData.privateKey, mockEthereum);
      expect(recoverTransaction(tx.rawTransaction)).toBe(testData.address);
    });
  });
});
