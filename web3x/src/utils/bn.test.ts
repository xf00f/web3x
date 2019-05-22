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

import BN from 'bn.js';
import { isBN, toBN, toTwosComplement } from './bn';
import { leftPad } from './padding';

describe('utils', () => {
  describe('toBN', () => {
    const tests = [
      { value: 1, expected: '1' },
      { value: '1', expected: '1' },
      { value: '0x1', expected: '1' },
      { value: '0x01', expected: '1' },
      { value: 15, expected: '15' },
      { value: '15', expected: '15' },
      { value: '0xf', expected: '15' },
      { value: '0x0f', expected: '15' },
      { value: new BN('f', 16), expected: '15' },
      { value: -1, expected: '-1' },
      { value: '-1', expected: '-1' },
      { value: '-0x1', expected: '-1' },
      { value: '-0x01', expected: '-1' },
      { value: -15, expected: '-15' },
      { value: '-15', expected: '-15' },
      { value: '-0xf', expected: '-15' },
      { value: '-0x0f', expected: '-15' },
      {
        value: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        expected: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
      },
      {
        value: '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd',
        expected: '115792089237316195423570985008687907853269984665640564039457584007913129639933',
      },
      {
        value: '-0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        expected: '-115792089237316195423570985008687907853269984665640564039457584007913129639935',
      },
      {
        value: '-0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd',
        expected: '-115792089237316195423570985008687907853269984665640564039457584007913129639933',
      },
      { value: 0, expected: '0' },
      { value: '0', expected: '0' },
      { value: '0x0', expected: '0' },
      { value: -0, expected: '0' },
      { value: '-0', expected: '0' },
      { value: '-0x0', expected: '0' },
      { value: new BN(0), expected: '0' },
    ];

    tests.forEach(test => {
      it('should turn ' + test.value + ' to ' + test.expected, () => {
        expect(toBN(test.value).toString(10)).toBe(test.expected);
      });
    });
  });

  describe('utils', () => {
    describe('isBN', () => {
      const tests = [
        { value: () => {}, is: false },
        { value: new Function(), is: false },
        { value: 'function', is: false },
        { value: {}, is: false },
        { value: 'hello', is: false },
        { value: new BN(0), is: true },
        { value: 132, is: false },
        { value: '0x12', is: false },
      ];

      tests.forEach(test => {
        it('shoud test if value is BN: ' + test.is, () => {
          expect(isBN(test.value)).toBe(test.is);
        });
      });
    });
  });

  describe('toTwosComplement', () => {
    const tests = [
      { value: 1, expected: leftPad(new BN(1).toString(16), 64) },
      { value: '1', expected: leftPad(new BN(1).toString(16), 64) },
      { value: '0x1', expected: leftPad(new BN(1).toString(16), 64) },
      { value: '15', expected: leftPad(new BN(15).toString(16), 64) },
      { value: '0xf', expected: leftPad(new BN(15).toString(16), 64) },
      {
        value: -1,
        expected: new BN('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16)
          .add(new BN(-1))
          .addn(1)
          .toString(16),
      },
      {
        value: '-1',
        expected: new BN('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16)
          .add(new BN(-1))
          .addn(1)
          .toString(16),
      },
      {
        value: '-0x1',
        expected: new BN('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16)
          .add(new BN(-1))
          .addn(1)
          .toString(16),
      },
      {
        value: '-15',
        expected: new BN('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16)
          .add(new BN(-15))
          .addn(1)
          .toString(16),
      },
      {
        value: '-0xf',
        expected: new BN('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16)
          .add(new BN(-15))
          .addn(1)
          .toString(16),
      },
      { value: 0, expected: leftPad(new BN(0).toString(16), 64) },
      { value: '0', expected: leftPad(new BN(0).toString(16), 64) },
      { value: '0x0', expected: leftPad(new BN(0).toString(16), 64) },
      { value: -0, expected: leftPad(new BN(0).toString(16), 64) },
      { value: '-0', expected: leftPad(new BN(0).toString(16), 64) },
      { value: '-0x0', expected: leftPad(new BN(0).toString(16), 64) },
      { value: new BN(15), expected: leftPad(new BN(15).toString(16), 64) },
    ];

    tests.forEach(test => {
      it('printing ' + test.value, () => {
        expect(toTwosComplement(test.value).replace('0x', '')).toBe(test.expected);
      });
    });
  });
});
