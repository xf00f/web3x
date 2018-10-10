import randomBytes from 'randombytes';
import { isAddress } from './address';
import { isBoolean, isObject, isString } from 'util';
import { isBN } from './bn';
import { utf8ToHex } from './hex-utf8';
import { numberToHex } from './hex-number';
import BN from 'bn.js';

/**
 * Check if string is HEX, requires a 0x in front
 *
 * @method isHexStrict
 * @param {String} hex to be checked
 * @returns {Boolean}
 */
export function isHexStrict(hex: string) {
  return /^(-)?0x[0-9a-f]*$/i.test(hex);
}

/**
 * Check if string is HEX
 *
 * @method isHex
 * @param {String} hex to be checked
 * @returns {Boolean}
 */
export function isHex(hex: string) {
  return /^(-0x|0x)?[0-9a-f]*$/i.test(hex);
}

/**
 * Auto converts any given value into it's hex representation.
 *
 * And even stringifys objects before.
 *
 * @method toHex
 * @param {String|Number|BN|Object} value
 * @param {Boolean} returnType
 * @return {String}
 */
export function toHex(value: string | number | BN | boolean | object, returnType?: any) {
  /*jshint maxcomplexity: false */

  if (isAddress(value)) {
    return returnType ? 'address' : '0x' + (value as string).toLowerCase().replace(/^0x/i, '');
  }

  if (isBoolean(value)) {
    return returnType ? 'bool' : value ? '0x01' : '0x00';
  }

  if (isObject(value) && !isBN(value)) {
    return returnType ? 'string' : utf8ToHex(JSON.stringify(value));
  }

  // if its a negative number, pass it through numberToHex
  if (isString(value)) {
    if (value.indexOf('-0x') === 0 || value.indexOf('-0X') === 0) {
      return returnType ? 'int256' : numberToHex(value);
    } else if (value.indexOf('0x') === 0 || value.indexOf('0X') === 0) {
      return returnType ? 'bytes' : value;
    } else if (!isFinite(+value)) {
      return returnType ? 'string' : utf8ToHex(value);
    }
  }

  return returnType ? (value < 0 ? 'int256' : 'uint256') : numberToHex(value);
}

export function randomHex(size) {
  if (size > 65536) {
    throw new Error('Requested too many random bytes.');
  }

  return '0x' + randomBytes(size).toString('hex');
}
