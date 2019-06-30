import JSBI from 'jsbi';
import { hexToBytes } from './hex-bytes';
import { leftPad } from './padding';

export const NegativeOne = JSBI.BigInt(-1);
export const Zero = JSBI.BigInt(0);
export const One = JSBI.BigInt(1);
export const Two = JSBI.BigInt(2);
export const WeiPerEther = JSBI.BigInt('1000000000000000000');
export const MaxUint256 = JSBI.subtract(JSBI.exponentiate(Two, JSBI.BigInt(256)), One);

export function fromTwos(x: JSBI, width: number) {
  if (JSBI.greaterThanOrEqual(x, JSBI.leftShift(One, JSBI.BigInt(width - 1)))) {
    return JSBI.unaryMinus(JSBI.add(maskn(JSBI.bitwiseNot(x), width), One));
  }
  return x;
}

export function toTwos(x: JSBI, width: number) {
  if (JSBI.lessThan(x, Zero)) {
    return JSBI.add(maskn(JSBI.bitwiseNot(JSBI.unaryMinus(x)), width), One);
  }
  return x;
}

export function maskn(x: JSBI, n: number) {
  const mask = JSBI.subtract(JSBI.leftShift(One, JSBI.BigInt(n)), One);
  return JSBI.bitwiseAnd(x, mask);
}

export function jsbiToArray(num: JSBI, width: number) {
  const hex = leftPad(num.toString(16), width * 2);
  return new Uint8Array(hexToBytes(hex, false));
}

export function jsbiFromArray(arr: Uint8Array) {
  return JSBI.BigInt(`0x${Buffer.from(arr).toString('hex')}`);
}
