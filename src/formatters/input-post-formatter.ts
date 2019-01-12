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
import { numberToHex, utf8ToHex } from '../utils';

/**
 * Formats the input of a whisper post and converts all values to HEX
 *
 * @method inputPostFormatter
 * @param {Object} transaction object
 * @returns {Object}
 */
export function inputPostFormatter(post) {
  // post.payload = utils.toHex(post.payload);

  if (post.ttl) {
    post.ttl = numberToHex(post.ttl);
  }
  if (post.workToProve) {
    post.workToProve = numberToHex(post.workToProve);
  }
  if (post.priority) {
    post.priority = numberToHex(post.priority);
  }

  // fallback
  if (!isArray(post.topics)) {
    post.topics = post.topics ? [post.topics] : [];
  }

  // format the following options
  post.topics = post.topics.map(topic => {
    // convert only if not hex
    return topic.indexOf('0x') === 0 ? topic : utf8ToHex(topic);
  });

  return post;
}
