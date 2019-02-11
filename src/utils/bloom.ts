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

import { Address } from '../address';
import { sha3 } from './sha3';
import { isTopic } from './topic';

/**
 * Ethereum bloom filter support.
 *
 * TODO UNDOCUMENTED
 *
 * @module bloom
 * @class [bloom] bloom
 */

function codePointToInt(codePoint) {
  if (codePoint >= 48 && codePoint <= 57) {
    /*['0'..'9'] -> [0..9]*/
    return codePoint - 48;
  }

  if (codePoint >= 65 && codePoint <= 70) {
    /*['A'..'F'] -> [10..15]*/
    return codePoint - 55;
  }

  if (codePoint >= 97 && codePoint <= 102) {
    /*['a'..'f'] -> [10..15]*/
    return codePoint - 87;
  }

  throw new Error('invalid bloom');
}

function testBytes(bloom, bytes: string) {
  const hash = sha3(bytes).replace('0x', '');

  for (let i = 0; i < 12; i += 4) {
    // calculate bit position in bloom filter that must be active
    const bitpos = ((parseInt(hash.substr(i, 2), 16) << 8) + parseInt(hash.substr(i + 2, 2), 16)) & 2047;

    // test if bitpos in bloom is active
    const code = codePointToInt(bloom.charCodeAt(bloom.length - 1 - Math.floor(bitpos / 4)));
    const offset = 1 << bitpos % 4;

    if ((code & offset) !== offset) {
      return false;
    }
  }

  return true;
}

/**
 * Returns true if address is part of the given bloom.
 * note: false positives are possible.
 *
 * @method testAddress
 * @param {String} hex encoded bloom
 * @param {String} address in hex notation
 * @returns {Boolean} topic is (probably) part of the block
 */
export let testAddress = (bloom: string, address: string) => {
  if (!isBloom(bloom)) {
    throw new Error('Invalid bloom given');
  }
  if (!Address.isAddress(address)) {
    throw new Error('Invalid address given: "' + address + '"');
  }

  return testBytes(bloom, address);
};

/**
 * Returns true if the topic is part of the given bloom.
 * note: false positives are possible.
 *
 * @method hasTopic
 * @param {String} hex encoded bloom
 * @param {String} address in hex notation
 * @returns {Boolean} topic is (probably) part of the block
 */
export let testTopic = (bloom: string, topic: string) => {
  if (!isBloom(bloom)) {
    throw new Error('invalid bloom');
  }
  if (!isTopic(topic)) {
    throw new Error('invalid topic');
  }

  return testBytes(bloom, topic);
};

/**
 * Returns true if given string is a valid Ethereum block header bloom.
 *
 * TODO UNDOCUMENTED
 *
 * @method isBloom
 * @param {String} hex encoded bloom filter
 * @return {Boolean}
 */
export let isBloom = (bloom: string) => {
  if (!/^(0x)?[0-9a-f]{512}$/i.test(bloom)) {
    return false;
  } else if (/^(0x)?[0-9a-f]{512}$/.test(bloom) || /^(0x)?[0-9A-F]{512}$/.test(bloom)) {
    return true;
  }
  return false;
};
