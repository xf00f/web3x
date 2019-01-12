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

import { hexToUtf8, utf8ToHex } from './hex-utf8';

describe('utils', () => {
  describe('utf8ToHex', () => {
    const tests = [
      {
        value: 'Heeäööä👅D34ɝɣ24Єͽ-.,äü+#/',
        expected: '0x486565c3a4c3b6c3b6c3a4f09f9185443334c99dc9a33234d084cdbd2d2e2cc3a4c3bc2b232f',
      },
      { value: 'myString', expected: '0x6d79537472696e67' },
      { value: 'myString\x00', expected: '0x6d79537472696e67' },
      { value: 'expected value\u0000\u0000\u0000', expected: '0x65787065637465642076616c7565' },
      { value: 'expect\u0000\u0000ed value\u0000\u0000\u0000', expected: '0x657870656374000065642076616c7565' },
      {
        value: '我能吞下玻璃而不伤身体。',
        expected: '0xe68891e883bde5909ee4b88be78ebbe79283e8808ce4b88de4bca4e8baabe4bd93e38082',
      },
      {
        value: '나는 유리를 먹을 수 있어요. 그래도 아프지 않아요',
        expected:
          '0xeb8298eb8a9420ec9ca0eba6aceba5bc20eba8b9ec9d8420ec889820ec9e88ec96b4ec9a942e20eab7b8eb9e98eb8f8420ec9584ed9484eca78020ec958aec9584ec9a94',
      },
    ];

    tests.forEach(test => {
      it('should turn ' + test.value + ' to ' + test.expected, () => {
        expect(utf8ToHex(test.value)).toBe(test.expected);
      });
    });
  });

  describe('hexToUtf8', () => {
    const tests = [
      {
        value: '0x486565c3a4c3b6c3b6c3a4f09f9185443334c99dc9a33234d084cdbd2d2e2cc3a4c3bc2b232f',
        expected: 'Heeäööä👅D34ɝɣ24Єͽ-.,äü+#/',
      },
      { value: '0x6d79537472696e67', expected: 'myString' },
      { value: '0x6d79537472696e6700', expected: 'myString' },
      { value: '0x65787065637465642076616c7565000000000000000000000000000000000000', expected: 'expected value' },
      {
        value: '0x000000000000000000000000000000000000657870656374000065642076616c7565',
        expected: 'expect\u0000\u0000ed value',
      },
    ];

    tests.forEach(test => {
      it('should turn ' + test.value + ' to ' + test.expected, () => {
        expect(hexToUtf8(test.value)).toBe(test.expected);
      });
    });
  });
});
