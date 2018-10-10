import { numberToHex, hexToNumberString, hexToNumber } from './hex-number';

describe('utils', () => {
  describe('numberToHex', () => {
    const tests = [
      { value: 1, expected: '0x1' },
      { value: '21345678976543214567869765432145647586', expected: '0x100f073a3d694d13d1615dc9bc3097e2' },
      { value: '1', expected: '0x1' },
      { value: '0x1', expected: '0x1' },
      { value: '0x01', expected: '0x1' },
      { value: 15, expected: '0xf' },
      { value: '15', expected: '0xf' },
      { value: '0xf', expected: '0xf' },
      { value: '0x0f', expected: '0xf' },
      { value: -1, expected: '-0x1' },
      { value: '-1', expected: '-0x1' },
      { value: '-0x1', expected: '-0x1' },
      { value: '-0x01', expected: '-0x1' },
      { value: -15, expected: '-0xf' },
      { value: '-15', expected: '-0xf' },
      { value: '-0xf', expected: '-0xf' },
      { value: '-0x0f', expected: '-0xf' },
      {
        value: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        expected: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      },
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
    ];

    tests.forEach(test => {
      it('should turn ' + test.value + ' to ' + test.expected, function() {
        expect(numberToHex(test.value)).toBe(test.expected);
      });
    });
  });

  describe('hexToNumber', function() {
    it('should return the correct value', function() {
      expect(hexToNumber('0x3e8')).toBe(1000);
      expect(hexToNumber('0x1f0fe294a36')).toBe(2134567897654);
      // allow compatiblity
      expect(hexToNumber(100000)).toBe(100000);
      expect(hexToNumber('100000')).toBe(100000);
    });
  });

  describe('hexToNumberString', function() {
    it('should return the correct value', function() {
      expect(hexToNumberString('0x3e8')).toBe('1000');
      expect(hexToNumberString('0x1f0fe294a36')).toBe('2134567897654');
      // allow compatiblity
      expect(hexToNumberString(100000)).toBe('100000');
      expect(hexToNumberString('100000')).toBe('100000');
    });
  });
});
