import { utf8ToHex } from '../../utils';
import { inputBlockNumberFormatter } from './input-block-number-formatter';
import { isArray } from 'util';
import { inputAddressFormatter } from './input-address-formatter';

/**
 * Formats the input of a log
 *
 * @method inputLogFormatter
 * @param {Object} log object
 * @returns {Object} log
 */
export function inputLogFormatter(options) {
  var toTopic: any = function(value) {
    if (value === null || typeof value === 'undefined') return null;

    value = String(value);

    return value.indexOf('0x') === 0 ? value : utf8ToHex(value);
  };

  if (options.fromBlock) options.fromBlock = inputBlockNumberFormatter(options.fromBlock);

  if (options.toBlock) options.toBlock = inputBlockNumberFormatter(options.toBlock);

  // make sure topics, get converted to hex
  options.topics = options.topics || [];
  options.topics = options.topics.map(function(topic) {
    return isArray(topic) ? topic.map(toTopic) : toTopic(topic);
  });

  toTopic = null;

  if (options.address) {
    options.address = isArray(options.address)
      ? options.address.map(function(addr) {
          return inputAddressFormatter(addr);
        })
      : inputAddressFormatter(options.address);
  }

  return options;
}
