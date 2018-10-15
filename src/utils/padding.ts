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

/**
 * Should be called to pad string to expected length
 *
 * @method leftPad
 * @param {String} string to be padded
 * @param {Number} chars that result string should have
 * @param {String} sign, by default 0
 * @returns {String} right aligned string
 */
export var leftPad = function(string: string, chars: number, sign = '0') {
  var hasPrefix = /^0x/i.test(string) || typeof string === 'number';
  string = string.toString().replace(/^0x/i, '');

  var padding = chars - string.length + 1 >= 0 ? chars - string.length + 1 : 0;

  return (hasPrefix ? '0x' : '') + new Array(padding).join(sign ? sign : '0') + string;
};

/**
 * Should be called to pad string to expected length
 *
 * @method rightPad
 * @param {String} string to be padded
 * @param {Number} chars that result string should have
 * @param {String} sign, by default 0
 * @returns {String} right aligned string
 */
export var rightPad = function(string: string, chars: number, sign = '0') {
  var hasPrefix = /^0x/i.test(string) || typeof string === 'number';
  string = string.toString().replace(/^0x/i, '');

  var padding = chars - string.length + 1 >= 0 ? chars - string.length + 1 : 0;

  return (hasPrefix ? '0x' : '') + string + new Array(padding).join(sign ? sign : '0');
};
