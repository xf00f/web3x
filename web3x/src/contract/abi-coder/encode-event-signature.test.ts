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
        name: 'myEvent',
        type: 'event',
        inputs: [
          {
            type: 'uint256',
            name: 'myNumber',
          },
          {
            type: 'bytes32',
            name: 'myBytes',
          },
        ],
      },
    ],
    result: '0xf2eeb729e636a8cb783be044acf6b7b1e2c5863735b60d6daae84c366ee87d97',
  },
  {
    params: [
      {
        name: 'SomeEvent',
        type: 'event',
        inputs: [
          {
            type: 'bytes',
            name: 'somebytes',
          },
          {
            type: 'byte16',
            name: 'myBytes',
          },
        ],
      },
    ],
    result: '0xab132b6cdd50f8d4d2ea33c3f140a9b3cf40f451540c69765c4842508bb13838',
  },
  {
    params: [
      {
        name: 'AnotherEvent',
        type: 'event',
        inputs: [],
      },
    ],
    result: '0x601d819e31a3cd164f83f7a7cf9cb5042ab1acff87b773c68f63d059c0af2dc0',
  },
];

describe('encodeEventSignature', () => {
  tests.forEach(test => {
    it('should convert correctly', () => {
      expect(abiCoder.encodeEventSignature.apply(abiCoder, test.params as any)).toEqual(test.result);
    });
  });
});
