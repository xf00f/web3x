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
import { Iban } from './iban';

describe('iban', () => {
  describe('createIndirect', () => {
    const tests = [{ institution: 'XREG', identifier: 'GAVOFYORK', expected: 'XE81ETHXREGGAVOFYORK' }];

    tests.forEach(test => {
      it('shoud create indirect iban: ' + test.expected, () => {
        expect(
          Iban.createIndirect({
            institution: test.institution,
            identifier: test.identifier,
          }),
        ).toEqual(new Iban(test.expected));
      });
    });
  });

  describe('toAddress / instance address', () => {
    const tests = [
      { direct: 'XE7338O073KYGTWWZN0F2WZ0R8PX5ZPPZS', address: '0x00c5496aEe77C1bA1f0854206A26DdA82a81D6D8' },
      { direct: 'XE7338O073KYGTWWZN0F2WZ0R8PX5ZPPZS', address: '0x00c5496aEe77C1bA1f0854206A26DdA82a81D6D8' },
      { direct: 'XE1222Q908LN1QBBU6XUQSO1OHWJIOS46OO', address: '0x11c5496AEE77c1bA1f0854206a26dDa82A81D6D8' },
      { direct: 'XE75JRZCTTLBSYEQBGAS7GID8DKR7QY0QA3', address: '0xa94f5374Fce5edBC8E2a8697C15331677e6EbF0B' },
    ];

    describe('toAddress', () => {
      tests.forEach(test => {
        it('should transform iban to address: ' + test.address, () => {
          expect(Iban.toAddress(test.direct).toString()).toBe(test.address);
        });
      });

      it('should error', () => {
        expect(() => Iban.toAddress('XE81ETHXREGGAVOFYORK')).toThrow();
      });
    });

    describe('instance address', () => {
      tests.forEach(test => {
        it('should transform iban to address: ' + test.address, () => {
          const iban = new Iban(test.direct);
          expect(iban.toAddress().toString()).toBe(test.address);
        });
      });
    });
  });

  describe('fromAddress', () => {
    const tests = [
      { address: '00c5496aee77c1ba1f0854206a26dda82a81d6d8', expected: 'XE7338O073KYGTWWZN0F2WZ0R8PX5ZPPZS' },
      { address: '0x00c5496aee77c1ba1f0854206a26dda82a81d6d8', expected: 'XE7338O073KYGTWWZN0F2WZ0R8PX5ZPPZS' },
      { address: '0x11c5496aee77c1ba1f0854206a26dda82a81d6d8', expected: 'XE1222Q908LN1QBBU6XUQSO1OHWJIOS46OO' },
      { address: '0x52dc504a422f0e2a9e7632a34a50f1a82f8224c7', expected: 'XE499OG1EH8ZZI0KXC6N83EKGT1BM97P2O7' },
      { address: '0x0000a5327eab78357cbf2ae8f3d49fd9d90c7d22', expected: 'XE0600DQK33XDTYUCRI0KYM5ELAKXDWWF6' },
    ];

    tests.forEach(test => {
      it('shoud create indirect iban: ' + test.expected, () => {
        expect(Iban.fromString(test.address)).toEqual(new Iban(test.expected));
      });
    });
  });

  describe('toIban', () => {
    const tests = [
      { address: '00c5496aee77c1ba1f0854206a26dda82a81d6d8', expected: 'XE7338O073KYGTWWZN0F2WZ0R8PX5ZPPZS' },
      { address: '0x00c5496aee77c1ba1f0854206a26dda82a81d6d8', expected: 'XE7338O073KYGTWWZN0F2WZ0R8PX5ZPPZS' },
      { address: '0x11c5496aee77c1ba1f0854206a26dda82a81d6d8', expected: 'XE1222Q908LN1QBBU6XUQSO1OHWJIOS46OO' },
      { address: '0x52dc504a422f0e2a9e7632a34a50f1a82f8224c7', expected: 'XE499OG1EH8ZZI0KXC6N83EKGT1BM97P2O7' },
      { address: '0x0000a5327eab78357cbf2ae8f3d49fd9d90c7d22', expected: 'XE0600DQK33XDTYUCRI0KYM5ELAKXDWWF6' },
    ];

    tests.forEach(test => {
      it('should create indirect iban: ' + test.expected, () => {
        expect(Iban.toIban(Address.fromString(test.address))).toBe(test.expected);
      });
    });
  });

  describe('isValid', () => {
    const tests = [
      { obj: () => {}, is: false },
      { obj: new Function(), is: false },
      { obj: 'function', is: false },
      { obj: {}, is: false },
      { obj: '[]', is: false },
      { obj: '[1, 2]', is: false },
      { obj: '{}', is: false },
      { obj: '{"a": 123, "b" :3,}', is: false },
      { obj: '{"c" : 2}', is: false },
      { obj: 'XE81ETHXREGGAVOFYORK', is: true },
      { obj: 'XE82ETHXREGGAVOFYORK', is: false },
      { obj: 'XE81ETCXREGGAVOFYORK', is: false },
      { obj: 'XE81ETHXREGGAVOFYORKD', is: false },
      { obj: 'XE81ETHXREGGaVOFYORK', is: false },
      { obj: 'XE7338O073KYGTWWZN0F2WZ0R8PX5ZPPZS', is: true },
      { obj: 'XE7438O073KYGTWWZN0F2WZ0R8PX5ZPPZS', is: false },
      { obj: 'XD7338O073KYGTWWZN0F2WZ0R8PX5ZPPZS', is: false },
      { obj: 'XE1222Q908LN1QBBU6XUQSO1OHWJIOS46OO', is: true },
    ];

    tests.forEach(test => {
      it('shoud test if value ' + test.obj + ' is iban: ' + test.is, () => {
        expect(Iban.isValid(test.obj)).toBe(test.is);
      });
    });
  });
});
