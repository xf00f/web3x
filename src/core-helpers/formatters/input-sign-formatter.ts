import { utf8ToHex, isHexStrict } from '../../utils';

/**
 * Hex encodes the data passed to eth_sign and personal_sign
 *
 * @method inputSignFormatter
 * @param {String} data
 * @returns {String}
 */
export function inputSignFormatter(data) {
  return isHexStrict(data) ? data : utf8ToHex(data);
}
