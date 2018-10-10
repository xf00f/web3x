import { toBN } from '../../utils';

/**
 * Should the format output to a big number
 *
 * @method outputBigNumberFormatter
 * @param {String|Number|BigNumber} number
 * @returns {BigNumber} object
 */
export function outputBigNumberFormatter(number) {
  return toBN(number).toString(10);
}
