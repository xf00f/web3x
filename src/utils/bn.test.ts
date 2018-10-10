import BN from 'bn.js';
import { toBN, isBN, toTwosComplement } from './bn';
import { leftPad } from './padding';

describe('utils', function() {
  describe('toBN', function() {
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

    tests.forEach(function(test) {
      it('should turn ' + test.value + ' to ' + test.expected, function() {
        expect(toBN(test.value).toString(10)).toBe(test.expected);
      });
    });
  });

  describe('utils', function() {
    describe('isBN', function() {
      const tests = [
        { value: function() {}, is: false },
        { value: new Function(), is: false },
        { value: 'function', is: false },
        { value: {}, is: false },
        { value: new String('hello'), is: false },
        { value: new BN(0), is: true },
        { value: 132, is: false },
        { value: '0x12', is: false },
      ];

      tests.forEach(function(test) {
        it('shoud test if value is BN: ' + test.is, function() {
          expect(isBN(test.value)).toBe(test.is);
        });
      });
    });
  });

  describe('toTwosComplement', function() {
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

    tests.forEach(function(test) {
      it('printing ' + test.value, function() {
        expect(toTwosComplement(test.value).replace('0x', '')).toBe(test.expected);
      });
    });
  });
});
