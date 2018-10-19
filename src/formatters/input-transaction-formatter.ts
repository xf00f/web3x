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

import { numberToHex, isHex } from '../utils';
import { isNumber, isObject } from 'util';
import { inputAddressFormatter } from './input-address-formatter';

/**
 * Formats the input of a transaction and converts all values to HEX
 *
 * @method inputTransactionFormatter
 * @param {Object} options
 * @returns object
 */
export function inputTransactionFormatter(options) {
  options = _txInputFormatter(options);

  // check from, only if not number, or object
  if (!isNumber(options.from) && !isObject(options.from)) {
    options.from = options.from || (this ? this.defaultAccount : null);

    if (!options.from && !isNumber(options.from)) {
      throw new Error('The send transactions "from" field must be defined!');
    }

    options.from = inputAddressFormatter(options.from);
  }

  return options;
}

/*
 * Formats the input of a transaction and converts all values to HEX
 *
 * @method inputCallFormatter
 * @param {Object} transaction options
 * @returns object
 */
export function inputCallFormatter(options) {
  options = _txInputFormatter(options);

  var from = options.from || (this ? this.defaultAccount : null);

  if (from) {
    options.from = inputAddressFormatter(from);
  }

  return options;
}

/**
 * Formats the input of a transaction and converts all values to HEX
 *
 * @method _txInputFormatter
 * @param {Object} transaction options
 * @returns object
 */
function _txInputFormatter(options) {
  if (options.to) {
    // it might be contract creation
    options.to = inputAddressFormatter(options.to);
  }

  if (options.data && options.input) {
    throw new Error(
      'You can\'t have "data" and "input" as properties of transactions at the same time, please use either "data" or "input" instead.',
    );
  }

  if (!options.data && options.input) {
    options.data = options.input;
    delete options.input;
  }

  if (options.data && !isHex(options.data)) {
    throw new Error('The data field must be HEX encoded data.');
  }

  ['gasPrice', 'gas', 'value', 'nonce']
    .filter(function(key) {
      return options[key] !== undefined;
    })
    .forEach(function(key) {
      options[key] = numberToHex(options[key]);
    });

  return options;
}
