import { numberToHex, isHex } from '../../utils';
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

  // allow both
  if (options.gas || options.gasLimit) {
    options.gas = options.gas || options.gasLimit;
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
