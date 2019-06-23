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
import { numberToBN } from './number-to-bn';

/**
 * Returns true if object is BN, otherwise false
 *
 * @method isBN
 * @param {Object} object
 * @return {Boolean}
 */
export function isBN(object) {
  return object instanceof BN || (object && object.constructor && object.constructor.name === 'BN');
}

/**
 * Takes an input and transforms it into an BN
 *
 * @method toBN
 * @param {Number|String|BN} num, string, HEX string or BN
 * @return {BN} BN
 */
export function toBN(num: number | string | BN) {
  try {
    return numberToBN(num);
  } catch (e) {
    throw new Error(e + ' Given value: "' + num + '"');
  }
}

/**
 * Takes and input transforms it into BN and if it is negative value, into two's complement
 *
 * @method toTwosComplement
 * @param {Number|String|BN} num
 * @return {String}
 */
export function toTwosComplement(num: number | string | BN) {
  return (
    '0x' +
    toBN(num)
      .toTwos(256)
      .toString(16, 64)
  );
}
