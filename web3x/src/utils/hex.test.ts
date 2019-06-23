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
import { toHex } from './hex';

describe('utils', () => {
  describe('toHex', () => {
    const tests = [
      { value: 1, expected: '0x1' },
      { value: '1', expected: '0x1' },
      { value: '0x1', expected: '0x1' },
      { value: '15', expected: '0xf' },
      { value: '0xf', expected: '0xf' },
      { value: -1, expected: '-0x1' },
      { value: '-1', expected: '-0x1' },
      { value: '-0x1', expected: '-0x1' },
      { value: '-15', expected: '-0xf' },
      { value: '-0xf', expected: '-0xf' },
      { value: '0x657468657265756d', expected: '0x657468657265756d' },
      {
        value: '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd',
        expected: '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd',
      },
      {
        value: '-0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        expected: '-0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      },
      {
        value: '-0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd',
        expected: '-0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd',
      },
      { value: 0, expected: '0x0' },
      { value: '0', expected: '0x0' },
      { value: '0x0', expected: '0x0' },
      { value: -0, expected: '0x0' },
      { value: '-0', expected: '0x0' },
      { value: '-0x0', expected: '0x0' },
      { value: [1, 2, 3, { test: 'data' }], expected: '0x5b312c322c332c7b2274657374223a2264617461227d5d' },
      { value: { test: 'test' }, expected: '0x7b2274657374223a2274657374227d' },
      { value: '{"test": "test"}', expected: '0x7b2274657374223a202274657374227d' },
      { value: 'myString', expected: '0x6d79537472696e67' },
      { value: 'myString 34534!', expected: '0x6d79537472696e6720333435333421' },
      { value: new BN(15), expected: '0xf' },
      {
        value: 'Heeäööä👅D34ɝɣ24Єͽ-.,äü+#/',
        expected: '0x486565c3a4c3b6c3b6c3a4f09f9185443334c99dc9a33234d084cdbd2d2e2cc3a4c3bc2b232f',
      },
      { value: true, expected: '0x01' },
      { value: false, expected: '0x00' },
      {
        value:
          'ff\u0003\u0000\u0000\u00005èÆÕL]\u0012|Î¾\u001a7«\u00052\u0011(ÐY\n<\u0010\u0000\u0000\u0000\u0000\u0000\u0000e!ßd/ñõì\f:z¦Î¦±ç·÷Í¢Ëß\u00076*\bñùC1ÉUÀé2\u001aÓB',
        expected:
          '0x66660300000035c3a8c386c3954c5d127cc29dc38ec2bec29e1a37c2abc29b05321128c390c297590a3c100000000000006521c39f642fc3b1c3b5c3ac0c3a7ac2a6c38ec2a6c2b1c3a7c2b7c3b7c38dc2a2c38bc39f07362ac28508c28ec297c3b1c29ec3b94331c38955c380c3a9321ac393c28642c28c',
      },
      {
        value:
          '\u0003\u0000\u0000\u00005èÆÕL]\u0012|Î¾\u001a7«\u00052\u0011(ÐY\n<\u0010\u0000\u0000\u0000\u0000\u0000\u0000e!ßd/ñõì\f:z¦Î¦±ç·÷Í¢Ëß\u00076*\bñùC1ÉUÀé2\u001aÓB',
        expected:
          '0x0300000035c3a8c386c3954c5d127cc29dc38ec2bec29e1a37c2abc29b05321128c390c297590a3c100000000000006521c39f642fc3b1c3b5c3ac0c3a7ac2a6c38ec2a6c2b1c3a7c2b7c3b7c38dc2a2c38bc39f07362ac28508c28ec297c3b1c29ec3b94331c38955c380c3a9321ac393c28642c28c',
      },
      { value: '내가 제일 잘 나가', expected: '0xeb82b4eab08020eca09cec9dbc20ec9e9820eb8298eab080' },
    ];

    tests.forEach(test => {
      it('should turn ' + test.value + ' to ' + test.expected, () => {
        expect(toHex(test.value)).toBe(test.expected);
      });
    });
  });
});
