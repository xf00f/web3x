import BN from 'bn.js';
import { unitMap, fromWei as ethjsFromWei, toWei as ethjsToWei } from './units-ethjs-unit';
import { isBN } from './bn';
import { isString } from 'util';

/**
 * Returns value of unit in Wei
 *
 * @method getUnitValue
 * @param {String} unit the unit to convert to, default ether
 * @returns {BN} value of the unit (in Wei)
 * @throws error if the unit is not correct:w
 */
function getUnitValue(unit) {
  unit = unit ? unit.toLowerCase() : 'ether';
  if (!unitMap[unit]) {
    throw new Error(
      'This unit "' +
        unit +
        '" doesn\'t exist, please use the one of the following units' +
        JSON.stringify(unitMap, null, 2),
    );
  }
  return unit;
}

/**
 * Takes a number of wei and converts it to any other ether unit.
 *
 * Possible units are:
 *   SI Short   SI Full        Effigy       Other
 * - kwei       femtoether     babbage
 * - mwei       picoether      lovelace
 * - gwei       nanoether      shannon      nano
 * - --         microether     szabo        micro
 * - --         milliether     finney       milli
 * - ether      --             --
 * - kether                    --           grand
 * - mether
 * - gether
 * - tether
 *
 * @method fromWei
 * @param {Number|String} number can be a number, number string or a HEX of a decimal
 * @param {String} unit the unit to convert to, default ether
 * @return {String|Object} When given a BN object it returns one as well, otherwise a number
 */
export function fromWei(number: number | string, unit: keyof typeof unitMap) {
  unit = getUnitValue(unit);

  if (!isBN(number) && !isString(number)) {
    throw new Error('Please pass numbers as strings or BigNumber objects to avoid precision errors.');
  }

  return isBN(number) ? new BN(ethjsFromWei(number, unit)) : ethjsFromWei(number, unit);
}

/**
 * Takes a number of a unit and converts it to wei.
 *
 * Possible units are:
 *   SI Short   SI Full        Effigy       Other
 * - kwei       femtoether     babbage
 * - mwei       picoether      lovelace
 * - gwei       nanoether      shannon      nano
 * - --         microether     szabo        micro
 * - --         microether     szabo        micro
 * - --         milliether     finney       milli
 * - ether      --             --
 * - kether                    --           grand
 * - mether
 * - gether
 * - tether
 *
 * @method toWei
 * @param {Number|String|BN} number can be a number, number string or a HEX of a decimal
 * @param {String} unit the unit to convert from, default ether
 * @return {String|Object} When given a BN object it returns one as well, otherwise a number
 */
export function toWei(number: number | string, unit: keyof typeof unitMap) {
  unit = getUnitValue(unit);

  if (!isBN(number) && !isString(number)) {
    throw new Error('Please pass numbers as strings or BigNumber objects to avoid precision errors.');
  }

  return isBN(number) ? ethjsToWei(number, unit) : ethjsToWei(number, unit).toString(10);
}
