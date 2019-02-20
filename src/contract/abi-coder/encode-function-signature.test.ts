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
    ],
    result: '0x24ee0097',
  },
  {
    params: [
      {
        name: 'myMethod',
        type: 'function',
        inputs: [
          {
            type: 'string',
            name: 'myNumber',
          },
          {
            type: 'bytes8',
            name: 'myString',
          },
        ],
      },
    ],
    result: '0x27b00c93',
  },
  {
    params: [
      {
        name: 'Somthing',
        type: 'function',
        inputs: [
          {
            type: 'uint16',
            name: 'myNumber',
          },
          {
            type: 'bytes',
            name: 'myString',
          },
        ],
      },
    ],
    result: '0x724ff7a1',
  },
  {
    params: [
      {
        name: 'something',
        type: 'function',
        inputs: [],
      },
    ],
    result: '0xa7a0d537',
  },
  {
    params: [
      {
        name: 'create',
        type: 'function',
        inputs: [
          {
            name: 'tokenId',
            type: 'uint256',
          },
          {
            name: 'itemOwner',
            type: 'address',
          },
          {
            name: 'keys',
            type: 'bytes32[]',
          },
          {
            name: 'values',
            type: 'bytes32[]',
          },
        ],
      },
    ],
    result: '0x04d36f08',
  },
];

describe('encodeFunctionSignature', () => {
  tests.forEach(test => {
    it('should convert correctly', () => {
      expect(abiCoder.encodeFunctionSignature.apply(abiCoder, test.params as any)).toEqual(test.result);
    });
  });
});
