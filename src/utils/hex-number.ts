import BN from 'bn.js';
import { toBN } from './bn';
import { isHexStrict } from './hex';

/**
 * Converts value to it's number representation
 *
 * @method hexToNumber
 * @param {String|Number|BN} value
 * @return {String}
 */
export function hexToNumber(value: string | number): number | null {
  if (value === undefined || value === null) {
    return null;
  }
  return toBN(value).toNumber();
}

/**
 * Converts value to it's decimal representation in string
 *
 * @method hexToNumberString
 * @param {String|Number|BN} value
 * @return {String}
 */
export function hexToNumberString(value: string | number | undefined): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  return toBN(value).toString(10);
}

/**
 * Converts value to it's hex representation
 *
 * @method numberToHex
 * @param {String|Number|BN} value
 * @return {String}
 */
export function numberToHex(value): string {
  if (!isFinite(value) && !isHexStrict(value)) {
    throw new Error('Given input "' + value + '" is not a number.');
  }

  var number = toBN(value);
  var result = number.toString(16);

  return number.lt(new BN(0)) ? '-0x' + result.substr(1) : '0x' + result;
}
