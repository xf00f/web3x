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

import { Address } from './index';

describe('address', () => {
  it('should return correct string', () => {
    const address = Address.fromString('0xc6d9d2cd449a754c494264e1809c50e34d64562b');
    expect(address.toString()).toBe('0xc6d9d2cD449A754c494264e1809c50e34D64562b');
  });

  it('should return correct buffer', () => {
    const address = Address.fromString('0xc6d9d2cd449a754c494264e1809c50e34d64562b');
    expect(address.toBuffer()).toEqual(Buffer.from('c6d9d2cD449A754c494264e1809c50e34D64562b', 'hex'));
  });

  it('should return correct 32 byte buffer', () => {
    const address = Address.fromString('0xc6d9d2cd449a754c494264e1809c50e34d64562b');
    expect(address.toBuffer32()).toEqual(
      Buffer.from('000000000000000000000000c6d9d2cD449A754c494264e1809c50e34D64562b', 'hex'),
    );
  });

  it('should create address from 32 byte buffer', () => {
    const buffer = Buffer.from('000000000000000000000000c6d9d2cD449A754c494264e1809c50e34D64562b', 'hex');
    expect(new Address(buffer)).toEqual(Address.fromString('0xc6d9d2cD449A754c494264e1809c50e34D64562b'));
  });

  it('should not create address from 32 byte buffer that does not start with 12 0 bytes', () => {
    const buffer = Buffer.from('010000000000000000000000c6d9d2cD449A754c494264e1809c50e34D64562b', 'hex');
    expect(() => new Address(buffer)).toThrowError();
  });

  it('should have correct zero address', () => {
    expect(Address.ZERO.toString()).toBe('0x0000000000000000000000000000000000000000');
  });

  describe('isAddress', () => {
    it(`should return true for valid prefixed address`, () => {
      expect(Address.isAddress('0xc6d9d2cd449a754c494264e1809c50e34d64562b')).toBe(true);
    });

    it(`should return true for valid unprefixed address`, () => {
      expect(Address.isAddress('c6d9d2cd449a754c494264e1809c50e34d64562b')).toBe(true);
    });

    it(`should return true for valid all uppercase address`, () => {
      expect(Address.isAddress('0xC6D9D2CD449A754C494264E1809C50E34D64562B')).toBe(true);
    });

    it(`should return true for correctly checksummed address`, () => {
      expect(Address.isAddress('0xE247A45c287191d435A8a5D72A7C8dc030451E9F')).toBe(true);
    });

    it(`should return false for badly checksummed address`, () => {
      expect(Address.isAddress('0xE247A45C287191d435A8a5D72A7C8dc030451E9F')).toBe(false);
    });

    it(`should return false for non hex characters`, () => {
      expect(Address.isAddress('0xg6d9d2cd449a754c494264e1809c50e34d64562b')).toBe(false);
    });
  });

  describe('checkAddressChecksum', () => {
    const tests = [
      { value: '0x52908400098527886E0F7030069857D2E4169EE7', is: true },
      { value: '0x8617E340B3D01FA5F11F306F4090FD50E238070D', is: true },
      { value: '0xde709f2102306220921060314715629080e2fb77', is: true },
      { value: '0x27b1fdb04752bbc536007a920d24acb045561c26', is: true },
      { value: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed', is: true },
      { value: '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359', is: true },
      { value: '0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB', is: true },
      { value: '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb', is: true },
      { value: '0XD1220A0CF47C7B9BE7A2E6BA89F429762E7B9ADB', is: false },
      { value: '0xd1220a0cf47c7b9be7a2e6ba89f429762e7b9adb', is: false },
    ];

    tests.forEach(test => {
      it(`should return ${test.is} for address ${test.value}`, () => {
        expect(Address.checkAddressChecksum(test.value)).toBe(test.is);
      });
    });
  });

  describe('toChecksumAddress', () => {
    const tests = [
      { value: '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed', is: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed' },
      { value: '0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359', is: '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359' },
      { value: '0xdbf03b407c01e7cd3cbea99509d93f8dddc8c6fb', is: '0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB' },
    ];

    tests.forEach(test => {
      it(`should return ${test.is} for address ${test.value}`, () => {
        expect(Address.toChecksumAddress(test.value)).toBe(test.is);
      });
    });
  });
});
