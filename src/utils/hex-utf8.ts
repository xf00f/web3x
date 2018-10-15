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

import utf8 from 'utf8';
import { isHexStrict } from './hex';

/**
 * Should be called to get hex representation (prefixed by 0x) of utf8 string
 *
 * @method utf8ToHex
 * @param {String} str
 * @returns {String} hex representation of input string
 */
export var utf8ToHex = function(str: string) {
  str = utf8.encode(str);
  var hex = '';

  // remove \u0000 padding from either side
  str = str.replace(/^(?:\u0000)*/, '');
  str = str
    .split('')
    .reverse()
    .join('');
  str = str.replace(/^(?:\u0000)*/, '');
  str = str
    .split('')
    .reverse()
    .join('');

  for (var i = 0; i < str.length; i++) {
    var code = str.charCodeAt(i);
    // if (code !== 0) {
    var n = code.toString(16);
    hex += n.length < 2 ? '0' + n : n;
    // }
  }

  return '0x' + hex;
};

/**
 * Should be called to get utf8 from it's hex representation
 *
 * @method hexToUtf8
 * @param {String} hex
 * @returns {String} ascii string representation of hex value
 */
export var hexToUtf8 = function(hex: string) {
  if (!isHexStrict(hex)) throw new Error('The parameter "' + hex + '" must be a valid HEX string.');

  var str = '';
  var code = 0;
  hex = hex.replace(/^0x/i, '');

  // remove 00 padding from either side
  hex = hex.replace(/^(?:00)*/, '');
  hex = hex
    .split('')
    .reverse()
    .join('');
  hex = hex.replace(/^(?:00)*/, '');
  hex = hex
    .split('')
    .reverse()
    .join('');

  var l = hex.length;

  for (var i = 0; i < l; i += 2) {
    code = parseInt(hex.substr(i, 2), 16);
    // if (code !== 0) {
    str += String.fromCharCode(code);
    // }
  }

  return utf8.decode(str);
};
