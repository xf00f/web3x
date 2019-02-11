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

import { asciiToHex, hexToAscii } from './hex-ascii';

describe('utils', () => {
  describe('asciiToHex', () => {
    const tests = [
      { value: 'myString', expected: '0x6d79537472696e67' },
      { value: 'myString\x00', expected: '0x6d79537472696e6700' },
      {
        value:
          '\u0003\u0000\u0000\u00005èÆÕL]\u0012|Î¾\u001a7«\u00052\u0011(ÐY\n<\u0010\u0000\u0000\u0000\u0000\u0000\u0000e!ßd/ñõì\f:z¦Î¦±ç·÷Í¢Ëß\u00076*\bñùC1ÉUÀé2\u001aÓB',
        expected:
          '0x0300000035e8c6d54c5d127c9dcebe9e1a37ab9b05321128d097590a3c100000000000006521df642ff1f5ec0c3a7aa6cea6b1e7b7f7cda2cbdf07362a85088e97f19ef94331c955c0e9321ad386428c',
      },
    ];

    tests.forEach(test => {
      it('should turn ' + test.value + ' to ' + test.expected, () => {
        expect(asciiToHex(test.value)).toBe(test.expected);
      });
    });
  });

  describe('hexToAscii', () => {
    const tests = [
      { value: '0x6d79537472696e67', expected: 'myString' },
      { value: '0x6d79537472696e6700', expected: 'myString\u0000' },
      {
        value:
          '0x0300000035e8c6d54c5d127c9dcebe9e1a37ab9b05321128d097590a3c100000000000006521df642ff1f5ec0c3a7aa6cea6b1e7b7f7cda2cbdf07362a85088e97f19ef94331c955c0e9321ad386428c',
        expected:
          '\u0003\u0000\u0000\u00005èÆÕL]\u0012|Î¾\u001a7«\u00052\u0011(ÐY\n<\u0010\u0000\u0000\u0000\u0000\u0000\u0000e!ßd/ñõì\f:z¦Î¦±ç·÷Í¢Ëß\u00076*\bñùC1ÉUÀé2\u001aÓB',
      },
    ];

    tests.forEach(test => {
      it('should turn ' + test.value + ' to ' + test.expected, () => {
        expect(hexToAscii(test.value)).toBe(test.expected);
      });
    });
  });
});
