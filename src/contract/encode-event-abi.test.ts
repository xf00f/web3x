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

import { encodeEventABI } from './encode-event-abi';

describe('eth', () => {
  describe('contract', () => {
    describe('encode-event-abi', () => {
      const addressLowercase = '0x11f4d0a3c12e86b4b5f39b213f7e19d048276dae';

      it('encodeEventABI should return the encoded event object without topics', () => {
        const result = encodeEventABI(
          {
            signature: '0x1234',
            name: 'Changed',
            type: 'event',
            inputs: [
              { name: 'from', type: 'address', indexed: true },
              { name: 'amount', type: 'uint256', indexed: true },
              { name: 't1', type: 'uint256', indexed: false },
              { name: 't2', type: 'uint256', indexed: false },
            ],
          },
          addressLowercase,
        );

        expect(result).toEqual({
          address: addressLowercase,
          topics: ['0x1234', null, null],
        });
      });

      it('encodeEventABI should return the encoded event object with topics', () => {
        const result = encodeEventABI(
          {
            signature: '0x1234',
            name: 'Changed',
            type: 'event',
            inputs: [
              { name: 'from', type: 'address', indexed: true },
              { name: 'amount', type: 'uint256', indexed: true },
              { name: 't1', type: 'uint256', indexed: false },
              { name: 't2', type: 'uint256', indexed: false },
            ],
          },
          addressLowercase,
          { filter: { amount: 12 }, fromBlock: 2 },
        );

        expect(result).toEqual({
          address: addressLowercase,
          fromBlock: '0x2',
          topics: ['0x1234', null, '0x000000000000000000000000000000000000000000000000000000000000000c'],
        });
      });

      it('encodeEventABI should return the encoded event object with topics and multiple choices', () => {
        const result = encodeEventABI(
          {
            signature: '0x1234',
            name: 'Changed',
            type: 'event',
            inputs: [
              { name: 'test', type: 'uint256', indexed: true },
              { name: 'from', type: 'address', indexed: true },
              { name: 'amount', type: 'uint256', indexed: true },
              { name: 't1', type: 'uint256', indexed: false },
              { name: 't2', type: 'uint256', indexed: false },
            ],
          },
          addressLowercase,
          { filter: { amount: [12, 10], from: addressLowercase }, fromBlock: 2 },
        );

        expect(result).toEqual({
          address: addressLowercase,
          fromBlock: '0x2',
          topics: [
            '0x1234',
            null,
            '0x000000000000000000000000' + addressLowercase.replace('0x', ''),
            [
              '0x000000000000000000000000000000000000000000000000000000000000000c',
              '0x000000000000000000000000000000000000000000000000000000000000000a',
            ],
          ],
        });
      });

      const address = '0x1234567890123456789012345678901234567890';
      const signature = '0xffff';

      const tests = [
        {
          abi: {
            name: 'event1',
            inputs: [],
            signature,
          },
          options: {},
          expected: {
            address,
            topics: [signature],
          },
        },
        {
          abi: {
            name: 'event1',
            inputs: [
              {
                type: 'int',
                name: 'a',
                indexed: true,
              },
            ],
            signature,
          },
          options: {
            filter: {
              a: 16,
            },
          },
          expected: {
            address,
            topics: [signature, '0x0000000000000000000000000000000000000000000000000000000000000010'],
          },
        },
        {
          abi: {
            name: 'event1',
            inputs: [
              {
                type: 'int',
                name: 'a',
                indexed: true,
              },
              {
                type: 'int',
                name: 'b',
                indexed: true,
              },
              {
                type: 'int',
                name: 'c',
                indexed: false,
              },
              {
                type: 'int',
                name: 'd',
                indexed: true,
              },
            ],
            signature,
          },
          options: {
            filter: {
              b: 4,
            },
          },
          expected: {
            address,
            topics: [
              signature, // signature
              null, // a
              '0x0000000000000000000000000000000000000000000000000000000000000004', // b
              null, // d
            ],
          },
        },
        {
          abi: {
            name: 'event1',
            inputs: [
              {
                type: 'int',
                name: 'a',
                indexed: true,
              },
              {
                type: 'int',
                name: 'b',
                indexed: true,
              },
            ],
            signature,
          },
          options: {
            filter: {
              a: [16, 1],
              b: 2,
            },
          },
          expected: {
            address,
            topics: [
              signature,
              [
                '0x0000000000000000000000000000000000000000000000000000000000000010',
                '0x0000000000000000000000000000000000000000000000000000000000000001',
              ],
              '0x0000000000000000000000000000000000000000000000000000000000000002',
            ],
          },
        },
        {
          abi: {
            name: 'event1',
            inputs: [
              {
                type: 'int',
                name: 'a',
                indexed: true,
              },
            ],
            signature,
          },
          options: {
            filter: {
              a: null,
            },
          },
          expected: {
            address,
            topics: [signature, null],
          },
        },
        {
          abi: {
            name: 'event1',
            inputs: [
              {
                type: 'int',
                name: 'a',
                indexed: true,
              },
            ],
            signature,
          },
          options: {
            filter: {
              a: 1,
            },
            fromBlock: 'latest',
            toBlock: 'pending',
          },
          expected: {
            address,
            fromBlock: 'latest',
            toBlock: 'pending',
            topics: [signature, '0x0000000000000000000000000000000000000000000000000000000000000001'],
          },
        },
        {
          abi: {
            name: 'event1',
            inputs: [
              {
                type: 'int',
                name: 'a',
                indexed: true,
              },
            ],
            signature,
          },
          options: {
            filter: {
              a: 1,
            },
            fromBlock: 4,
            toBlock: 10,
          },
          expected: {
            address,
            fromBlock: '0x4',
            toBlock: '0xa',
            topics: [signature, '0x0000000000000000000000000000000000000000000000000000000000000001'],
          },
        },
        {
          abi: {
            name: 'event1',
            inputs: [
              {
                type: 'int',
                name: 'a',
                indexed: true,
              },
            ],
            anonymous: true,
            signature,
          },
          options: {
            filter: {
              a: 1,
            },
          },
          expected: {
            address,
            topics: ['0x0000000000000000000000000000000000000000000000000000000000000001'],
          },
        },
        {
          abi: {
            name: 'event1',
            inputs: [
              {
                type: 'int',
                name: 'a',
                indexed: true,
              },
              {
                type: 'int',
                name: 'b',
                indexed: true,
              },
            ],
            anonymous: true,
            signature,
          },
          options: {
            filter: {
              b: 1,
            },
          },
          expected: {
            address,
            topics: [null, '0x0000000000000000000000000000000000000000000000000000000000000001'],
          },
        },
      ];

      tests.forEach((test, index) => {
        it('test no: ' + index, () => {
          const result = encodeEventABI(test.abi, address, test.options);
          expect(result).toEqual(test.expected);
        });
      });
    });
  });
});
