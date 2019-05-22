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

import { isHexStrict, utf8ToHex } from '.';
import { Address } from '../address';
import { hashMessage } from './hash-message';
import { hexToBuffer } from './hex-buffer';
import { recover, recoverFromSignature, recoverFromSigString, recoverFromVRS, sign } from './sign';

const tests = [
  {
    address: Address.fromString('0xEB014f8c8B418Db6b45774c326A0E64C78914dC0'),
    privateKey: hexToBuffer('0xbe6383dad004f233317e46ddb46ad31b16064d14447a95cc1d8c8d4bc61c3728'),
    data: 'Some data',
    signature:
      '0xa8037a6116c176a25e6fc224947fde9e79a2deaa0dd8b67b366fbdfdbffc01f953e41351267b20d4a89ebfe9c8f03c04de9b345add4a52f15bd026b63c8fb1501b',
  },
  {
    address: Address.fromString('0xEB014f8c8B418Db6b45774c326A0E64C78914dC0'),
    privateKey: hexToBuffer('0xbe6383dad004f233317e46ddb46ad31b16064d14447a95cc1d8c8d4bc61c3728'),
    data: 'Some data!%$$%&@*',
    signature:
      '0x05252412b097c5d080c994d1ea12abcee6f1cae23feb225517a0b691a66e12866b3f54292f9cfef98f390670b4d010fc4af7fcd46e41d72870602c117b14921c1c',
  },
  {
    address: Address.fromString('0xEB014f8c8B418Db6b45774c326A0E64C78914dC0'),
    privateKey: hexToBuffer('0xbe6383dad004f233317e46ddb46ad31b16064d14447a95cc1d8c8d4bc61c3728'),
    data: '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470',
    signature:
      '0xddd493679d80c9c74e0e5abd256a496dfb31b51cd39ea2c7c9e8a2a07de94a90257107a00d9cb631bacb85b208d66bfa7a80c639536b34884505eff352677dd01c',
  },
];

describe('utils', () => {
  describe('sign', () => {
    tests.forEach(test => {
      it('sign data using a string', () => {
        const data = sign(test.data, test.privateKey);

        expect(data.signature).toBe(test.signature);
      });

      it('sign data using a utf8 encoded hex string', () => {
        const data = isHexStrict(test.data) ? test.data : utf8ToHex(test.data);
        const sig = sign(data, test.privateKey);

        expect(sig.signature).toBe(test.signature);
      });

      it('recover signature using a string', () => {
        const address1 = recoverFromSigString(test.data, test.signature);
        const address2 = recover(test.data, test.signature);

        expect(address1).toEqual(test.address);
        expect(address2).toEqual(test.address);
      });

      it('recover signature using a string and preFixed', () => {
        const address = recoverFromSigString(hashMessage(test.data), test.signature, true);

        expect(address).toEqual(test.address);
      });

      it('recover signature using a hash and r s v values and preFixed', () => {
        const sig = sign(test.data, test.privateKey);
        const address = recoverFromVRS(hashMessage(test.data), sig.v, sig.r, sig.s, true);

        expect(address).toEqual(test.address);
      });

      it('recover signature (pre encoded) using a signature object', () => {
        const data = isHexStrict(test.data) ? test.data : utf8ToHex(test.data);
        const sig = sign(data, test.privateKey);
        const address = recoverFromSignature(sig);

        expect(address).toEqual(test.address);
      });

      it('recover signature using a signature object', () => {
        const sig = sign(test.data, test.privateKey);
        const address1 = recoverFromSignature(sig);
        const address2 = recover(sig);

        expect(address1).toEqual(test.address);
        expect(address2).toEqual(test.address);
      });

      it('recover signature (pre encoded) using a hash and r s v values', () => {
        const data = isHexStrict(test.data) ? test.data : utf8ToHex(test.data);
        const sig = sign(data, test.privateKey);
        const address1 = recoverFromVRS(test.data, sig.v, sig.r, sig.s);
        const address2 = recover(test.data, sig.v, sig.r, sig.s);

        expect(address1).toEqual(test.address);
        expect(address2).toEqual(test.address);
      });

      it('recover signature using a hash and r s v values', () => {
        const sig = sign(test.data, test.privateKey);
        const address1 = recoverFromVRS(test.data, sig.v, sig.r, sig.s);

        expect(address1).toEqual(test.address);
      });
    });
  });
});
