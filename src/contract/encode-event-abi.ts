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

import { isArray } from 'util';
import { inputBlockNumberFormatter } from '../formatters';
import { abiCoder } from './abi-coder';

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
  const filter = options.filter || {};
  const result: any = {};

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
      const indexedTopics = event.inputs
        .filter(i => {
          return i.indexed === true;
        })
        .map(i => {
          const value = filter[i.name];
          if (!value) {
            return null;
          }

          // TODO: https://github.com/ethereum/web3x/issues/344
          // TODO: deal properly with components

          if (isArray(value)) {
            return value.map(v => {
              return abiCoder.encodeParameter(i.type, v);
            });
          }
          return abiCoder.encodeParameter(i.type, value);
        });

      result.topics = result.topics.concat(indexedTopics);
    }

    if (!result.topics.length) {
      delete result.topics;
    }
  }

  if (address) {
    result.address = address.toLowerCase();
  }

  return result;
}
