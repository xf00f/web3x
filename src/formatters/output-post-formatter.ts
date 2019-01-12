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

import { hexToNumber, hexToUtf8 } from '../utils';

/**
 * Formats the output of a received post message
 *
 * @method outputPostFormatter
 * @param {Object}
 * @returns {Object}
 */
export function outputPostFormatter(post) {
  post.expiry = hexToNumber(post.expiry);
  post.sent = hexToNumber(post.sent);
  post.ttl = hexToNumber(post.ttl);
  post.workProved = hexToNumber(post.workProved);
  // post.payloadRaw = post.payload;
  // post.payload = utils.hexToAscii(post.payload);

  // if (utils.isJson(post.payload)) {
  //     post.payload = JSON.parse(post.payload);
  // }

  // format the following options
  if (!post.topics) {
    post.topics = [];
  }
  post.topics = post.topics.map(topic => {
    return hexToUtf8(topic);
  });

  return post;
}
