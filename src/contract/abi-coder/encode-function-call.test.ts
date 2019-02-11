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

import { abiCoder } from '.';

const tests = [
  {
    params: [
      {
        name: 'myMethod',
        type: 'function',
        inputs: [
          {
            type: 'uint256',
            name: 'myNumber',
          },
          {
            type: 'string',
            name: 'myString',
          },
        ],
      },
      ['2345675643', 'Hello!%'],
    ],
    result:
      '0x24ee0097000000000000000000000000000000000000000000000000000000008bd02b7b0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000748656c6c6f212500000000000000000000000000000000000000000000000000',
  },
  {
    params: [
      {
        name: 'myOtherMethod',
        type: 'function',
        inputs: [
          {
            type: 'uint16',
            name: 'myNumberdd',
          },
          {
            type: 'bytes32',
            name: 'myBytes',
          },
        ],
      },
      [2323, '0x234567432145678543213456'],
    ],
    result:
      '0xed6d6f8500000000000000000000000000000000000000000000000000000000000009132345674321456785432134560000000000000000000000000000000000000000',
  },
  {
    params: [
      {
        name: 'myMethod',
        type: 'function',
        inputs: [
          {
            type: 'uint256',
            name: 'myNumber',
          },
          {
            type: 'bytes',
            name: 'myBytes',
          },
        ],
      },
      ['2345675643', '0x23456743214567854321ffffdddddd'],
    ],
    result:
      '0x4c6a9980000000000000000000000000000000000000000000000000000000008bd02b7b0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000f23456743214567854321ffffdddddd0000000000000000000000000000000000',
  },
];

describe('encodeFunctionCall', () => {
  tests.forEach(test => {
    it('should convert correctly', () => {
      expect(abiCoder.encodeFunctionCall.apply(abiCoder, test.params as any)).toEqual(test.result);
    });
  });
});
