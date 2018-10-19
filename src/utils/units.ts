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
export function fromWei(number: string, unit: keyof typeof unitMap): string;
export function fromWei(number: BN, unit: keyof typeof unitMap): BN;
export function fromWei(number: string | BN, unit: keyof typeof unitMap) {
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
export function toWei(number: BN, unit: keyof typeof unitMap): BN;
export function toWei(number: string, unit: keyof typeof unitMap): string;
export function toWei(number: string | BN, unit: keyof typeof unitMap) {
  unit = getUnitValue(unit);

  if (!isBN(number) && !isString(number)) {
    throw new Error('Please pass numbers as strings or BigNumber objects to avoid precision errors.');
  }

  return isBN(number) ? ethjsToWei(number, unit) : ethjsToWei(number, unit).toString(10);
}
