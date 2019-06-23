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
import { fromRawTransactionResponse } from './transaction-response-formatter';

describe('formatters', () => {
  describe('transactionResponseFormatter', () => {
    it('should return the correct value', () => {
      expect(
        fromRawTransactionResponse({
          input: '0x3454645634534',
          from: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
          to: '0x11f4d0a3c12e86b4b5f39b213f7e19d048276dae',
          value: '0x3e8',
          gas: '0x3e8',
          gasPrice: '0x3e8',
          nonce: '0xb',
          transactionIndex: '0x1',
          blockNumber: '0x3e8',
          blockHash: '0xc9b9cdc2092a9d6589d96662b1fd6949611163fb3910cf8a173cd060f17702f9',
          hash: '0xd9b9cdc2092a9d6589d96662b1fd6949611163fb3910cf8a173cd060f17702f9',
          v: 'v',
          r: 'r',
          s: 's',
        }),
      ).toEqual({
        input: '0x3454645634534',
        from: Address.fromString('0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe'),
        to: Address.fromString('0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe'),
        value: '1000',
        gas: 1000,
        gasPrice: '1000',
        nonce: 11,
        blockNumber: 1000,
        blockHash: '0xc9b9cdc2092a9d6589d96662b1fd6949611163fb3910cf8a173cd060f17702f9',
        transactionIndex: 1,
        hash: '0xd9b9cdc2092a9d6589d96662b1fd6949611163fb3910cf8a173cd060f17702f9',
        v: 'v',
        r: 'r',
        s: 's',
      });
    });

    it('should return the correct value, when null values are present', () => {
      expect(
        fromRawTransactionResponse({
          input: '0x3454645634534',
          from: '0x11f4d0a3c12e86b4b5f39b213f7e19d048276dae',
          to: null,
          value: '0x3e8',
          gas: '0x3e8',
          gasPrice: '0x3e8',
          nonce: '0xb',
          transactionIndex: null,
          blockNumber: null,
          blockHash: null,
          hash: '0xd9b9cdc2092a9d6589d96662b1fd6949611163fb3910cf8a173cd060f17702f9',
          v: 'v',
          r: 'r',
          s: 's',
        }),
      ).toEqual({
        input: '0x3454645634534',
        from: Address.fromString('0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe'),
        to: null,
        value: '1000',
        gas: 1000,
        gasPrice: '1000',
        nonce: 11,
        blockNumber: null,
        blockHash: null,
        transactionIndex: null,
        hash: '0xd9b9cdc2092a9d6589d96662b1fd6949611163fb3910cf8a173cd060f17702f9',
        v: 'v',
        r: 'r',
        s: 's',
      });
    });
  });
});
