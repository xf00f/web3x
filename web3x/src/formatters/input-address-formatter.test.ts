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

import { inputAddressFormatter } from './input-address-formatter';

const tests = [
  { input: 'XE7338O073KYGTWWZN0F2WZ0R8PX5ZPPZS', result: '0x00c5496aee77c1ba1f0854206a26dda82a81d6d8' },
  { input: 'XE75JRZCTTLBSYEQBGAS7GID8DKR7QY0QA3', result: '0xa94f5374fce5edbc8e2a8697c15331677e6ebf0b' },
  { input: '0x00c5496aee77c1ba1f0854206a26dda82a81d6d8', result: '0x00c5496aee77c1ba1f0854206a26dda82a81d6d8' },
  { input: '00c5496aee77c1ba1f0854206a26dda82a81d6d8', result: '0x00c5496aee77c1ba1f0854206a26dda82a81d6d8' },
  { input: '11f4d0a3c12e86b4b5f39b213f7e19d048276dae', result: '0x11f4d0a3c12e86b4b5f39b213f7e19d048276dae' },
  { input: '0x11f4d0a3c12e86b4b5f39b213f7e19d048276dae', result: '0x11f4d0a3c12e86b4b5f39b213f7e19d048276dae' },
  { input: '0x11F4D0A3C12E86B4B5F39B213F7E19D048276DAE', result: '0x11f4d0a3c12e86b4b5f39b213f7e19d048276dae' },
  { input: '0X11F4D0A3C12E86B4B5F39B213F7E19D048276DAE', result: '0x11f4d0a3c12e86b4b5f39b213f7e19d048276dae' },
  { input: '11F4D0A3C12E86B4B5F39B213F7E19D048276DAE', result: '0x11f4d0a3c12e86b4b5f39b213f7e19d048276dae' },
  { input: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe', result: '0x11f4d0a3c12e86b4b5f39b213f7e19d048276dae' },
];

const errorTests = [
  '0x0c5496aee77c1ba1f0854206a26dda82a81d6d8',
  '0x0c5496aee77c1ba1f0854206a26dda82a81d6d8',
  '00c5496aee77c1ba1f0854206a26dda82a81d6d',
  'XE7338O073KYGTWWZN0F2WZ0R8PX5ZPPZE',
  '0x',
  '0x11f4d0a3c12e86B4b5F39b213f7E19D048276DAe',
  '',
];

describe('formatters', () => {
  describe('inputAddressFormatter correct addresses', () => {
    tests.forEach(test => {
      it('should return the correct value', () => {
        expect(inputAddressFormatter(test.input)).toBe(test.result);
      });
    });
  });

  describe('inputAddressFormatter wrong addresses', () => {
    errorTests.forEach(test => {
      it('should throw an exception', () => {
        expect(() => inputAddressFormatter(test)).toThrow();
      });
    });
  });
});
