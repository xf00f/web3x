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

import { isHex, isHexStrict } from './hex';

/**
 * Convert a byte array to a hex string
 *
 * Note: Implementation from crypto-js
 *
 * @method bytesToHex
 * @param {Array} bytes
 * @return {String} the hex string
 */
export function bytesToHex(bytes: number[], prefix: boolean = true) {
  const hex: any[] = [];
  for (const byte of bytes) {
    /* jshint ignore:start */
    hex.push((byte >>> 4).toString(16));
    hex.push((byte & 0xf).toString(16));
    /* jshint ignore:end */
  }
  return prefix ? '0x' + hex.join('') : hex.join('');
}

/**
 * Convert a hex string to a byte array
 *
 * Note: Implementation from crypto-js
 *
 * @method hexToBytes
 * @param {string} hex
 * @return {Array} the byte array
 */
export function hexToBytes(hex: string, prefix: boolean = true): number[] {
  if ((prefix && !isHexStrict(hex)) || !isHex(hex)) {
    throw new Error('Given value "' + hex + '" is not a valid hex string.');
  }

  hex = hex.replace(/^0x/i, '');

  const bytes: any[] = [];
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return bytes;
}
