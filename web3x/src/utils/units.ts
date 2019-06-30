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
import { isString } from 'util';

const zero = JSBI.BigInt(0);
const negative1 = JSBI.BigInt(-1);

export const unitMap = {
  noether: '0',
  wei: '1',
  kwei: '1000',
  Kwei: '1000',
  babbage: '1000',
  femtoether: '1000',
  mwei: '1000000',
  Mwei: '1000000',
  lovelace: '1000000',
  picoether: '1000000',
  gwei: '1000000000',
  Gwei: '1000000000',
  shannon: '1000000000',
  nanoether: '1000000000',
  nano: '1000000000',
  szabo: '1000000000000',
  microether: '1000000000000',
  micro: '1000000000000',
  finney: '1000000000000000',
  milliether: '1000000000000000',
  milli: '1000000000000000',
  ether: '1000000000000000000',
  kether: '1000000000000000000000',
  grand: '1000000000000000000000',
  mether: '1000000000000000000000000',
  gether: '1000000000000000000000000000',
  tether: '1000000000000000000000000000000',
};

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
 * @param {Number|String} num can be a number, number string or a HEX of a decimal
 * @param {String} unit the unit to convert to, default ether
 * @return {String|Object} When given a BN object it returns one as well, otherwise a number
 */
export function fromWei(num: string, unit: keyof typeof unitMap): string;
export function fromWei(num: JSBI, unit: keyof typeof unitMap): JSBI;
export function fromWei(num: string | JSBI, unit: keyof typeof unitMap) {
  unit = getUnitValue(unit);

  return isString(num) ? ethjsFromWei(num, unit) : JSBI.BigInt(ethjsFromWei(num, unit));
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
 * @param {Number|String|BN} num can be a number, number string or a HEX of a decimal
 * @param {String} unit the unit to convert from, default ether
 * @return {String|Object} When given a BN object it returns one as well, otherwise a number
 */
export function toWei(num: JSBI, unit: keyof typeof unitMap): JSBI;
export function toWei(num: string, unit: keyof typeof unitMap): string;
export function toWei(num: string | JSBI, unit: keyof typeof unitMap) {
  unit = getUnitValue(unit);

  return isString(num) ? ethjsToWei(num, unit).toString(10) : ethjsToWei(num, unit);
}

/**
 * Returns value of unit in Wei
 *
 * @method getValueOfUnit
 * @param {String} unit the unit to convert to, default ether
 * @returns {BigNumber} value of the unit (in Wei)
 * @throws error if the unit is not correct:w
 */
function getValueOfUnit(unitInput) {
  const unit = unitInput ? unitInput.toLowerCase() : 'ether';
  const unitValue = unitMap[unit]; // eslint-disable-line

  if (typeof unitValue !== 'string') {
    throw new Error(
      `[ethjs-unit] the unit provided ${unitInput} doesn't exists, please use the one of the following units ${JSON.stringify(
        unitMap,
        null,
        2,
      )}`,
    );
  }

  return JSBI.BigInt(unitValue);
}

function numberToString(arg) {
  if (typeof arg === 'string') {
    if (!arg.match(/^-?[0-9.]+$/)) {
      throw new Error(
        `while converting number to string, invalid number value '${arg}', should be a number matching (^-?[0-9.]+).`,
      );
    }
    return arg;
  } else if (typeof arg === 'number') {
    return String(arg);
  } else if (typeof arg === 'object' && arg.toString && (arg.toTwos || arg.dividedToIntegerBy)) {
    if (arg.toPrecision) {
      return String(arg.toPrecision());
    } else {
      // eslint-disable-line
      return arg.toString(10);
    }
  }
  throw new Error(`while converting number to string, invalid number value '${arg}' type ${typeof arg}.`);
}

function ethjsFromWei(weiInput, unit, optionsInput?) {
  let wei = JSBI.BigInt(weiInput);
  const negative = JSBI.lessThan(wei, zero);
  const base = getValueOfUnit(unit);
  const baseLength = unitMap[unit].length - 1 || 1;
  const options = optionsInput || {};

  if (negative) {
    wei = JSBI.unaryMinus(wei);
  }

  let fraction = JSBI.remainder(wei, base).toString(10);

  while (fraction.length < baseLength) {
    fraction = `0${fraction}`;
  }

  if (!options.pad) {
    fraction = fraction.match(/^([0-9]*[1-9]|0)(0*)/)![1];
  }

  let whole = JSBI.divide(wei, base).toString(10);

  if (options.commify) {
    whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  let value = `${whole}${fraction === '0' ? '' : `.${fraction}`}`;

  if (negative) {
    value = `-${value}`;
  }

  return value;
}

function ethjsToWei(etherInput, unit) {
  let ether = numberToString(etherInput); // eslint-disable-line
  const base = getValueOfUnit(unit);
  const baseLength = unitMap[unit].length - 1 || 1;

  // Is it negative?
  const negative = ether.substring(0, 1) === '-'; // eslint-disable-line
  if (negative) {
    ether = ether.substring(1);
  }

  if (ether === '.') {
    throw new Error(`[ethjs-unit] while converting number ${etherInput} to wei, invalid value`);
  }

  // Split it into a whole and fractional part
  const comps = ether.split('.'); // eslint-disable-line
  if (comps.length > 2) {
    throw new Error(`[ethjs-unit] while converting number ${etherInput} to wei,  too many decimal points`);
  }

  let whole = comps[0];
  let fraction = comps[1];

  if (!whole) {
    whole = '0';
  }
  if (!fraction) {
    fraction = '0';
  }
  if (fraction.length > baseLength) {
    throw new Error(`[ethjs-unit] while converting number ${etherInput} to wei, too many decimal places`);
  }

  while (fraction.length < baseLength) {
    fraction += '0';
  }

  whole = JSBI.BigInt(whole);
  fraction = JSBI.BigInt(fraction);
  let wei = JSBI.add(JSBI.multiply(whole, base), fraction);

  if (negative) {
    wei = JSBI.unaryMinus(wei);
  }

  return JSBI.BigInt(wei.toString(10));
}
