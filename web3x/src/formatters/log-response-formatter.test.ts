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
import { fromRawLogResponse } from './log-response-formatter';

describe('formatters', () => {
  describe('outputLogFormatter', () => {
    it('should return the correct value', () => {
      expect(
        fromRawLogResponse({
          transactionIndex: '0x3e8',
          logIndex: '0x3e8',
          blockNumber: '0x3e8',
          transactionHash: '0xd6960376d6c6dea93647383ffb245cfced97ccc5c7525397a543a72fdaea5265',
          blockHash: '0xd6960376d6c6dea93647383ffb245cfced97ccc5c7525397a543a72fdaea5265',
          data: '0x7b2274657374223a2274657374227',
          address: '0x11f4d0a3c12e86b4b5f39b213f7e19d048276dae',
          topics: ['0x68656c6c6f', '0x6d79746f70696373'],
        }),
      ).toEqual({
        transactionIndex: 1000,
        logIndex: 1000,
        blockNumber: 1000,
        transactionHash: '0xd6960376d6c6dea93647383ffb245cfced97ccc5c7525397a543a72fdaea5265',
        blockHash: '0xd6960376d6c6dea93647383ffb245cfced97ccc5c7525397a543a72fdaea5265',
        data: '0x7b2274657374223a2274657374227',
        topics: ['0x68656c6c6f', '0x6d79746f70696373'],
        address: Address.fromString('0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe'),
        id: 'log_2b801386',
      });
    });

    it('should return the correct value, when null values are present', () => {
      expect(
        fromRawLogResponse({
          transactionIndex: null,
          logIndex: null,
          blockNumber: null,
          transactionHash: null,
          blockHash: null,
          data: '0x7b2274657374223a2274657374227',
          topics: ['0x68656c6c6f', '0x6d79746f70696373'],
          address: '0x11f4d0a3c12e86b4b5f39b213f7e19d048276dae',
        }),
      ).toEqual({
        transactionIndex: null,
        logIndex: null,
        blockNumber: null,
        transactionHash: null,
        blockHash: null,
        id: null,
        data: '0x7b2274657374223a2274657374227',
        topics: ['0x68656c6c6f', '0x6d79746f70696373'],
        address: Address.fromString('0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe'),
      });
    });
  });
});
