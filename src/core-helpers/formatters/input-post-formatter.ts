import { numberToHex, utf8ToHex } from '../../utils';
import { isArray } from 'util';

/**
 * Formats the input of a whisper post and converts all values to HEX
 *
 * @method inputPostFormatter
 * @param {Object} transaction object
 * @returns {Object}
 */
export function inputPostFormatter(post) {
  // post.payload = utils.toHex(post.payload);

  if (post.ttl) post.ttl = numberToHex(post.ttl);
  if (post.workToProve) post.workToProve = numberToHex(post.workToProve);
  if (post.priority) post.priority = numberToHex(post.priority);

  // fallback
  if (!isArray(post.topics)) {
    post.topics = post.topics ? [post.topics] : [];
  }

  // format the following options
  post.topics = post.topics.map(function(topic) {
    // convert only if not hex
    return topic.indexOf('0x') === 0 ? topic : utf8ToHex(topic);
  });

  return post;
}
