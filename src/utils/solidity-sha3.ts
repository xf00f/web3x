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
import { isArray, isObject } from 'util';
import { Address } from '../address';
import { isBN } from './bn';
import { isHexStrict, toHex } from './hex';
import { utf8ToHex } from './hex-utf8';
import { leftPad, rightPad } from './padding';
import { sha3 } from './sha3';

const elementaryName = name => {
  /*jshint maxcomplexity:false */

  if (name.startsWith('int[')) {
    return 'int256' + name.slice(3);
  } else if (name === 'int') {
    return 'int256';
  } else if (name.startsWith('uint[')) {
    return 'uint256' + name.slice(4);
  } else if (name === 'uint') {
    return 'uint256';
  } else if (name.startsWith('fixed[')) {
    return 'fixed128x128' + name.slice(5);
  } else if (name === 'fixed') {
    return 'fixed128x128';
  } else if (name.startsWith('ufixed[')) {
    return 'ufixed128x128' + name.slice(6);
  } else if (name === 'ufixed') {
    return 'ufixed128x128';
  }
  return name;
};

// Parse N from type<N>
const parseTypeN = type => {
  const typesize = /^\D+(\d+).*$/.exec(type);
  return typesize ? parseInt(typesize[1], 10) : null;
};

// Parse N from type[<N>]
const parseTypeNArray = type => {
  const arraySize = /^\D+\d*\[(\d+)\]$/.exec(type);
  return arraySize ? parseInt(arraySize[1], 10) : null;
};

const parseNumber = arg => {
  const type = typeof arg;
  if (type === 'string') {
    if (isHexStrict(arg)) {
      return new BN(arg.replace(/0x/i, ''), 16);
    } else {
      return new BN(arg, 10);
    }
  } else if (type === 'number') {
    return new BN(arg);
  } else if (isBN(arg)) {
    return arg;
  } else {
    throw new Error(arg + ' is not a number');
  }
};

const solidityPack = (type, value, arraySize) => {
  /*jshint maxcomplexity:false */

  let size;
  let num;
  type = elementaryName(type);

  if (type === 'bytes') {
    if (value.replace(/^0x/i, '').length % 2 !== 0) {
      throw new Error('Invalid bytes characters ' + value.length);
    }

    return value;
  } else if (type === 'string') {
    return utf8ToHex(value);
  } else if (type === 'bool') {
    return value ? '01' : '00';
  } else if (type.startsWith('address')) {
    if (arraySize) {
      size = 64;
    } else {
      size = 40;
    }

    if (!Address.isAddress(value)) {
      throw new Error(value + ' is not a valid address, or the checksum is invalid.');
    }

    return leftPad(value.toLowerCase(), size);
  }

  size = parseTypeN(type);

  if (type.startsWith('bytes')) {
    if (!size) {
      throw new Error('bytes[] not yet supported in solidity');
    }

    // must be 32 byte slices when in an array
    if (arraySize) {
      size = 32;
    }

    if (size < 1 || size > 32 || size < value.replace(/^0x/i, '').length / 2) {
      throw new Error('Invalid bytes' + size + ' for ' + value);
    }

    return rightPad(value, size * 2);
  } else if (type.startsWith('uint')) {
    if (size % 8 || size < 8 || size > 256) {
      throw new Error('Invalid uint' + size + ' size');
    }

    num = parseNumber(value);
    if (num.bitLength() > size) {
      throw new Error('Supplied uint exceeds width: ' + size + ' vs ' + num.bitLength());
    }

    if (num.lt(new BN(0))) {
      throw new Error('Supplied uint ' + num.toString() + ' is negative');
    }

    return size ? leftPad(num.toString('hex'), (size / 8) * 2) : num;
  } else if (type.startsWith('int')) {
    if (size % 8 || size < 8 || size > 256) {
      throw new Error('Invalid int' + size + ' size');
    }

    num = parseNumber(value);
    if (num.bitLength() > size) {
      throw new Error('Supplied int exceeds width: ' + size + ' vs ' + num.bitLength());
    }

    if (num.lt(new BN(0))) {
      return num.toTwos(size).toString('hex');
    } else {
      return size ? leftPad(num.toString('hex'), (size / 8) * 2) : num;
    }
  } else {
    // FIXME: support all other types
    throw new Error('Unsupported or invalid type: ' + type);
  }
};

const processSoliditySha3Args = arg => {
  /*jshint maxcomplexity:false */

  if (isArray(arg)) {
    throw new Error('Autodetection of array types is not supported.');
  }

  let type;
  let value: any = '';
  let hexArg;
  let arraySize;

  // if type is given
  if (
    isObject(arg) &&
    (arg.hasOwnProperty('v') || arg.hasOwnProperty('t') || arg.hasOwnProperty('value') || arg.hasOwnProperty('type'))
  ) {
    type = arg.hasOwnProperty('t') ? arg.t : arg.type;
    value = arg.hasOwnProperty('v') ? arg.v : arg.value;

    // otherwise try to guess the type
  } else {
    type = toHex(arg, true);
    value = toHex(arg);

    if (!type.startsWith('int') && !type.startsWith('uint')) {
      type = 'bytes';
    }
  }

  if ((type.startsWith('int') || type.startsWith('uint')) && typeof value === 'string' && !/^(-)?0x/i.test(value)) {
    value = new BN(value);
  }

  // get the array size
  if (isArray(value)) {
    arraySize = parseTypeNArray(type);
    if (arraySize && value.length !== arraySize) {
      throw new Error(type + ' is not matching the given array ' + JSON.stringify(value));
    } else {
      arraySize = value.length;
    }
  }

  if (isArray(value)) {
    hexArg = value.map(val => {
      return solidityPack(type, val, arraySize)
        .toString('hex')
        .replace('0x', '');
    });
    return hexArg.join('');
  } else {
    hexArg = solidityPack(type, value, arraySize);
    return hexArg.toString('hex').replace('0x', '');
  }
};

/**
 * Hashes solidity values to a sha3 hash using keccak 256
 *
 * @method soliditySha3
 * @return {Object} the sha3
 */
export let soliditySha3 = (...args: any[]) => {
  /*jshint maxcomplexity:false */

  const hexArgs = args.map(processSoliditySha3Args);

  // console.log(args, hexArgs);
  // console.log('0x'+ hexArgs.join(''));

  return sha3('0x' + hexArgs.join(''));
};
