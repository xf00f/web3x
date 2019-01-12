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

import { outputPostFormatter } from './output-post-formatter';

describe('formatters', () => {
  describe('outputPostFormatter', () => {
    it('should return the correct value', () => {
      expect(
        outputPostFormatter({
          expiry: '0x3e8',
          sent: '0x3e8',
          ttl: '0x3e8',
          workProved: '0x3e8',
          payload: '0x7b2274657374223a2274657374227d',
          topics: ['0x68656c6c6f', '0x6d79746f70696373'],
        }),
      ).toEqual({
        expiry: 1000,
        sent: 1000,
        ttl: 1000,
        workProved: 1000,
        payload: '0x7b2274657374223a2274657374227d',
        topics: ['hello', 'mytopics'],
      });
    });
  });
});
