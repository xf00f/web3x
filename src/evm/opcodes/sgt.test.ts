import { toBigIntBE } from 'bigint-buffer';
import { Sgt } from './sgt';

describe('opcodes', () => {
  const tests = [
    [
      '0000000000000000000000000000000000000000000000000000000000000001',
      '0000000000000000000000000000000000000000000000000000000000000001',
      '0000000000000000000000000000000000000000000000000000000000000000',
    ],
    [
      'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      '0000000000000000000000000000000000000000000000000000000000000000',
    ],
    [
      '7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      '7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      '0000000000000000000000000000000000000000000000000000000000000000',
    ],
    [
      '0000000000000000000000000000000000000000000000000000000000000001',
      '7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      '0000000000000000000000000000000000000000000000000000000000000001',
    ],
    [
      '7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      '0000000000000000000000000000000000000000000000000000000000000001',
      '0000000000000000000000000000000000000000000000000000000000000000',
    ],
    [
      'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      '0000000000000000000000000000000000000000000000000000000000000001',
      '0000000000000000000000000000000000000000000000000000000000000001',
    ],
    [
      '0000000000000000000000000000000000000000000000000000000000000001',
      'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      '0000000000000000000000000000000000000000000000000000000000000000',
    ],
    [
      '8000000000000000000000000000000000000000000000000000000000000001',
      '8000000000000000000000000000000000000000000000000000000000000001',
      '0000000000000000000000000000000000000000000000000000000000000000',
    ],
    [
      '8000000000000000000000000000000000000000000000000000000000000001',
      '7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      '0000000000000000000000000000000000000000000000000000000000000001',
    ],
    [
      '7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      '8000000000000000000000000000000000000000000000000000000000000001',
      '0000000000000000000000000000000000000000000000000000000000000000',
    ],
    [
      'fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffb',
      'fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd',
      '0000000000000000000000000000000000000000000000000000000000000001',
    ],
    [
      'fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd',
      'fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffb',
      '0000000000000000000000000000000000000000000000000000000000000000',
    ],
  ];

  describe('sgt', () => {
    tests.forEach(test => {
      it('should produce correct result', () => {
        const y = toBigIntBE(Buffer.from(test[0], 'hex'));
        const x = toBigIntBE(Buffer.from(test[1], 'hex'));
        const r = toBigIntBE(Buffer.from(test[2], 'hex'));
        expect(Sgt.sgt(x, y)).toBe(r);
      });
    });
  });
});
