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
import randomBytes from 'randombytes';
import { isBoolean, isNumber, isObject, isString } from 'util';
import { Address } from '../address';
import { numberToHex } from './hex-number';
import { utf8ToHex } from './hex-utf8';
import { Zero } from './jsbi';

/**
 * Check if string is HEX, requires a 0x in front
 */
export function isHexStrict(hex: string) {
  return /^(-)?0x[0-9a-f]*$/i.test(hex);
}

/**
 * Check if string is HEX
 */
export function isHex(hex: string) {
  return /^(-0x|0x)?[0-9a-f]*$/i.test(hex);
}

/**
 * Auto converts any given value into it's hex representation.
 */
export function toHex(value: string | number | JSBI | boolean | object, returnType?: any) {
  if (isString(value) && Address.isAddress(value)) {
    return returnType ? 'address' : '0x' + value.replace(/^0x/i, '');
  }

  if (isBoolean(value)) {
    return returnType ? 'bool' : value ? '0x01' : '0x00';
  }

  if (value instanceof JSBI) {
    return returnType ? (JSBI.lessThan(value, Zero) ? 'int256' : 'uint256') : numberToHex(value);
  }

  if (typeof value === 'object') {
    return returnType ? 'string' : utf8ToHex(JSON.stringify(value));
  }

  if (isString(value)) {
    if (value.toLowerCase().indexOf('-0x') === 0) {
      return returnType ? 'int256' : value === '-0x0' ? '0x0' : value;
    }

    if (value.toLowerCase().indexOf('0x') === 0) {
      return returnType ? 'bytes' : value;
    }

    if (!isFinite(+value)) {
      return returnType ? 'string' : utf8ToHex(value);
    }
  }

  return returnType ? (value < 0 ? 'int256' : 'uint256') : numberToHex(value);
}

export function randomHex(size): string {
  if (size > 65536) {
    throw new Error('Requested too many random bytes.');
  }

  return '0x' + randomBytes(size).toString('hex');
}

export function randomBuffer(size): Buffer {
  if (size > 65536) {
    throw new Error('Requested too many random bytes.');
  }

  return randomBytes(size);
}

export function trimHexLeadingZero(hex: string) {
  return hex.replace(/^0x0*/, '0x');
}

export function makeHexEven(hex: string) {
  return hex.length % 2 === 1 ? hex.replace('0x', '0x0') : hex;
}
