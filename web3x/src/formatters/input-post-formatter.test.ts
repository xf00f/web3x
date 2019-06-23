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

import { inputPostFormatter } from './input-post-formatter';

describe('formatters', () => {
  describe('inputPostFormatter', () => {
    it('should return the correct value', () => {
      expect(
        inputPostFormatter({
          from: '0x00000',
          to: '0x00000',
          payload: '0x7b2274657374223a2274657374227d',
          ttl: 200,
          priority: 1000,
          topics: ['hello', 'mytopics'],
          workToProve: 1,
        }),
      ).toEqual({
        from: '0x00000',
        to: '0x00000',
        payload: '0x7b2274657374223a2274657374227d',
        ttl: '0xc8',
        priority: '0x3e8',
        topics: ['0x68656c6c6f', '0x6d79746f70696373'],
        workToProve: '0x1',
      });
    });
  });
});
