import { hexToNumber, hexToUtf8 } from '../../utils';

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
  post.topics = post.topics.map(function(topic) {
    return hexToUtf8(topic);
  });

  return post;
}
