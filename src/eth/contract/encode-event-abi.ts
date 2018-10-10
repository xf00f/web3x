import { abi } from '../abi';
import { inputBlockNumberFormatter } from '../../core-helpers/formatters';
import { isArray } from 'util';

/**
 * Should be used to encode indexed params and options to one final object
 *
 * @method _encodeEventABI
 * @param {Object} event
 * @param {Object} options
 * @return {Object} everything combined together and encoded
 */
export function encodeEventABI(event, address?: string, options?) {
  options = options || {};
  var filter = options.filter || {},
    result: any = {};

  ['fromBlock', 'toBlock']
    .filter(f => {
      return options[f] !== undefined;
    })
    .forEach(f => {
      result[f] = inputBlockNumberFormatter(options[f]);
    });

  // use given topics
  if (isArray(options.topics)) {
    result.topics = options.topics;

    // create topics based on filter
  } else {
    result.topics = [];

    // add event signature
    if (event && !event.anonymous && event.name !== 'ALLEVENTS') {
      result.topics.push(event.signature);
    }

    // add event topics (indexed arguments)
    if (event.name !== 'ALLEVENTS') {
      var indexedTopics = event.inputs
        .filter(i => {
          return i.indexed === true;
        })
        .map(i => {
          var value = filter[i.name];
          if (!value) {
            return null;
          }

          // TODO: https://github.com/ethereum/web3.js/issues/344
          // TODO: deal properly with components

          if (isArray(value)) {
            return value.map(v => {
              return abi.encodeParameter(i.type, v);
            });
          }
          return abi.encodeParameter(i.type, value);
        });

      result.topics = result.topics.concat(indexedTopics);
    }

    if (!result.topics.length) delete result.topics;
  }

  if (address) {
    result.address = address.toLowerCase();
  }

  return result;
}
