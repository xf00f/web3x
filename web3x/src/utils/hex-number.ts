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

import JSBI from 'jsbi';

/**
 * Converts value to it's number representation
 *
 * @method hexToNumber
 * @param {String|Number|BN} value
 * @return {String}
 */
export function hexToNumber(value: string): number {
  return Number(JSBI.BigInt(value).toString());
}

/**
 * Converts value to it's decimal representation in string
 *
 * @method hexToNumberString
 * @param {String|Number|BN} value
 * @return {String}
 */
export function hexToNumberString(value: string): string {
  return JSBI.BigInt(value).toString();
}

/**
 * Converts value to it's hex representation
 *
 * @method numberToHex
 * @param {String|Number|BN} value
 * @return {String}
 */
export function numberToHex(value: number | string | JSBI): string {
  const num = JSBI.BigInt(value);
  const result = num.toString(16);

  return JSBI.lessThan(num, JSBI.BigInt(0)) ? '-0x' + result.substr(1) : '0x' + result;
}
