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

import { Address } from '../../address';
import { sha3 } from '../../utils';
import { ContractEventEntry } from './contract-event-entry';

describe('contract', () => {
  describe('contract-event-entry', () => {
    it('should return the decoded event object with topics', () => {
      const address = Address.fromString('0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe');
      const signature = 'Changed(address,uint256,uint256,uint256)';

      const contractEventEntry = new ContractEventEntry({
        name: 'Changed',
        type: 'event',
        inputs: [
          { name: 'from', type: 'address', indexed: true },
          { name: 'amount', type: 'uint256', indexed: true },
          { name: 't1', type: 'uint256', indexed: false },
          { name: 't2', type: 'uint256', indexed: false },
        ],
      });

      const result = contractEventEntry.decodeEvent({
        id: '',
        address,
        topics: [
          sha3(signature),
          '0x000000000000000000000000' + address.toString().replace('0x', ''),
          '0x0000000000000000000000000000000000000000000000000000000000000001',
        ],
        blockNumber: 3,
        transactionHash: '0x1234',
        blockHash: '0x1345',
        transactionIndex: 0,
        logIndex: 4,
        data:
          '0x0000000000000000000000000000000000000000000000000000000000000001' +
          '0000000000000000000000000000000000000000000000000000000000000008',
      });

      expect(result.returnValues.from).toEqual(address);
      expect(result.returnValues.amount).toBe('1');
      expect(result.returnValues.t1).toBe('1');
      expect(result.returnValues.t2).toBe('8');
    });

    const name = 'event1';
    const address = '0xffdDb67890123456789012345678901234567890';

    const tests: any = [
      {
        abi: {
          name,
          type: 'event',
          inputs: [],
        },
        data: {
          logIndex: 1,
          transactionIndex: 16,
          transactionHash: '0x1234567890',
          address,
          blockHash: '0x1234567890',
          blockNumber: 1,
          id: 'log_c71f2e84',
        },
        expected: {
          event: name,
          signature: null,
          returnValues: {},
          logIndex: 1,
          transactionIndex: 16,
          transactionHash: '0x1234567890',
          address,
          blockHash: '0x1234567890',
          blockNumber: 1,
          id: 'log_c71f2e84',
          raw: {
            topics: [],
            data: '',
          },
        },
      },
      {
        abi: {
          name,
          inputs: [
            {
              name: 'a',
              type: 'int',
              indexed: false,
            },
          ],
        },
        data: {
          logIndex: 1,
          transactionIndex: 16,
          transactionHash: '0x1234567890',
          address,
          blockHash: '0x1234567890',
          blockNumber: 1,
          id: 'log_c71f2e84',
          data: '0x0000000000000000000000000000000000000000000000000000000000000001',
        },
        expected: {
          event: name,
          signature: null,
          returnValues: {
            0: '1',
            a: '1',
          },
          logIndex: 1,
          transactionIndex: 16,
          transactionHash: '0x1234567890',
          address,
          blockHash: '0x1234567890',
          blockNumber: 1,
          id: 'log_c71f2e84',
          raw: {
            data: '0x0000000000000000000000000000000000000000000000000000000000000001',
            topics: [],
          },
        },
      },
      {
        abi: {
          name,
          inputs: [
            {
              name: 'a',
              type: 'int',
              indexed: false,
            },
            {
              name: 'b',
              type: 'int',
              indexed: true,
            },
            {
              name: 'c',
              type: 'int',
              indexed: false,
            },
            {
              name: 'd',
              type: 'int',
              indexed: true,
            },
          ],
        },
        data: {
          logIndex: 1,
          transactionIndex: 16,
          transactionHash: '0x1234567890',
          address,
          blockHash: '0x1234567890',
          blockNumber: 1,
          id: 'log_c71f2e84',
          data:
            '0x' +
            '0000000000000000000000000000000000000000000000000000000000000001' +
            '0000000000000000000000000000000000000000000000000000000000000004',
          topics: [
            address,
            '0x000000000000000000000000000000000000000000000000000000000000000a',
            '0x0000000000000000000000000000000000000000000000000000000000000010',
          ],
        },
        expected: {
          event: name,
          signature: address,
          returnValues: {
            0: '1',
            1: '10',
            2: '4',
            3: '16',
            a: '1',
            b: '10',
            c: '4',
            d: '16',
          },
          logIndex: 1,
          transactionIndex: 16,
          transactionHash: '0x1234567890',
          address,
          blockHash: '0x1234567890',
          blockNumber: 1,
          id: 'log_c71f2e84',
          raw: {
            data:
              '0x' +
              '0000000000000000000000000000000000000000000000000000000000000001' +
              '0000000000000000000000000000000000000000000000000000000000000004',
            topics: [
              address,
              '0x000000000000000000000000000000000000000000000000000000000000000a',
              '0x0000000000000000000000000000000000000000000000000000000000000010',
            ],
          },
        },
      },
      {
        abi: {
          name,
          anonymous: true,
          inputs: [
            {
              name: 'a',
              type: 'int',
              indexed: false,
            },
            {
              name: 'b',
              type: 'int',
              indexed: true,
            },
            {
              name: 'c',
              type: 'int',
              indexed: false,
            },
            {
              name: 'd',
              type: 'int',
              indexed: true,
            },
          ],
        },
        data: {
          logIndex: 1,
          transactionIndex: 16,
          transactionHash: '0x1234567890',
          address,
          blockHash: '0x1234567890',
          blockNumber: 1,
          id: 'log_c71f2e84',
          data:
            '0x' +
            '0000000000000000000000000000000000000000000000000000000000000001' +
            '0000000000000000000000000000000000000000000000000000000000000004',
          topics: [
            '0x000000000000000000000000000000000000000000000000000000000000000a',
            '0x0000000000000000000000000000000000000000000000000000000000000010',
          ],
        },
        expected: {
          event: name,
          signature: null,
          returnValues: {
            0: '1',
            1: '10',
            2: '4',
            3: '16',
            a: '1',
            b: '10',
            c: '4',
            d: '16',
          },
          logIndex: 1,
          transactionIndex: 16,
          transactionHash: '0x1234567890',
          address,
          blockHash: '0x1234567890',
          blockNumber: 1,
          id: 'log_c71f2e84',
          raw: {
            data:
              '0x' +
              '0000000000000000000000000000000000000000000000000000000000000001' +
              '0000000000000000000000000000000000000000000000000000000000000004',
            topics: [
              '0x000000000000000000000000000000000000000000000000000000000000000a',
              '0x0000000000000000000000000000000000000000000000000000000000000010',
            ],
          },
        },
      },
    ];

    tests.forEach((test, index) => {
      it('test no: ' + index, () => {
        const contractEventEntry = new ContractEventEntry(test.abi);
        const result = contractEventEntry.decodeEvent(test.data);
        expect(result).toEqual(test.expected);
      });
    });
  });
});
