import { toBigIntBE } from 'bigint-buffer';
import { Slt } from './slt';

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
      '0000000000000000000000000000000000000000000000000000000000000000',
    ],
    [
      '7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      '0000000000000000000000000000000000000000000000000000000000000001',
      '0000000000000000000000000000000000000000000000000000000000000001',
    ],
    [
      'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      '0000000000000000000000000000000000000000000000000000000000000001',
      '0000000000000000000000000000000000000000000000000000000000000000',
    ],
    [
      '0000000000000000000000000000000000000000000000000000000000000001',
      'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      '0000000000000000000000000000000000000000000000000000000000000001',
    ],
    [
      '8000000000000000000000000000000000000000000000000000000000000001',
      '8000000000000000000000000000000000000000000000000000000000000001',
      '0000000000000000000000000000000000000000000000000000000000000000',
    ],
    [
      '8000000000000000000000000000000000000000000000000000000000000001',
      '7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      '0000000000000000000000000000000000000000000000000000000000000000',
    ],
    [
      '7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      '8000000000000000000000000000000000000000000000000000000000000001',
      '0000000000000000000000000000000000000000000000000000000000000001',
    ],
    [
      'fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffb',
      'fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd',
      '0000000000000000000000000000000000000000000000000000000000000000',
    ],
    [
      'fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd',
      'fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffb',
      '0000000000000000000000000000000000000000000000000000000000000001',
    ],
  ];

  describe('slt', () => {
    tests.forEach(test => {
      it('should produce correct result', () => {
        const y = toBigIntBE(Buffer.from(test[0], 'hex'));
        const x = toBigIntBE(Buffer.from(test[1], 'hex'));
        const r = toBigIntBE(Buffer.from(test[2], 'hex'));
        expect(Slt.slt(x, y)).toBe(r);
      });
    });
  });
});
