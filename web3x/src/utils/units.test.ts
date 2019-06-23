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

import { fromWei, toWei } from './units';

describe('utils', () => {
  describe('fromWei', () => {
    it('should return the correct value', () => {
      expect(fromWei('1000000000000000000', 'wei')).toBe('1000000000000000000');
      expect(fromWei('1000000000000000000', 'kwei')).toBe('1000000000000000');
      expect(fromWei('1000000000000000000', 'mwei')).toBe('1000000000000');
      expect(fromWei('1000000000000000000', 'gwei')).toBe('1000000000');
      expect(fromWei('1000000000000000000', 'szabo')).toBe('1000000');
      expect(fromWei('1000000000000000000', 'finney')).toBe('1000');
      expect(fromWei('1000000000000000000', 'ether')).toBe('1');
      expect(fromWei('1000000000000000000', 'kether')).toBe('0.001');
      expect(fromWei('1000000000000000000', 'grand')).toBe('0.001');
      expect(fromWei('1000000000000000000', 'mether')).toBe('0.000001');
      expect(fromWei('1000000000000000000', 'gether')).toBe('0.000000001');
      expect(fromWei('1000000000000000000', 'tether')).toBe('0.000000000001');
    });
  });

  describe('toWei', () => {
    it('should return the correct value', () => {
      expect(toWei('1', 'wei')).toBe('1');
      expect(toWei('1', 'kwei')).toBe('1000');
      expect(toWei('1', 'Kwei')).toBe('1000');
      expect(toWei('1', 'babbage')).toBe('1000');
      expect(toWei('1', 'mwei')).toBe('1000000');
      expect(toWei('1', 'Mwei')).toBe('1000000');
      expect(toWei('1', 'lovelace')).toBe('1000000');
      expect(toWei('1', 'gwei')).toBe('1000000000');
      expect(toWei('1', 'Gwei')).toBe('1000000000');
      expect(toWei('1', 'shannon')).toBe('1000000000');
      expect(toWei('1', 'szabo')).toBe('1000000000000');
      expect(toWei('1', 'finney')).toBe('1000000000000000');
      expect(toWei('1', 'ether')).toBe('1000000000000000000');
      expect(toWei('1', 'kether')).toBe('1000000000000000000000');
      expect(toWei('1', 'grand')).toBe('1000000000000000000000');
      expect(toWei('1', 'mether')).toBe('1000000000000000000000000');
      expect(toWei('1', 'gether')).toBe('1000000000000000000000000000');
      expect(toWei('1', 'tether')).toBe('1000000000000000000000000000000');

      expect(toWei('1', 'kwei')).toBe(toWei('1', 'femtoether'));
      expect(toWei('1', 'szabo')).toBe(toWei('1', 'microether'));
      expect(toWei('1', 'finney')).toBe(toWei('1', 'milliether'));
      expect(toWei('1', 'milli')).toBe(toWei('1', 'milliether'));
      expect(toWei('1', 'milli')).toBe(toWei('1000', 'micro'));
    });
  });
});
