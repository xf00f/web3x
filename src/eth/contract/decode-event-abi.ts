import { formatters } from '../../core-helpers';
import { abi } from '../abi';

/**
 * Should be used to decode indexed params and options
 *
 * @method _decodeEventABI
 * @param {Object} data
 * @return {Object} result object with decoded indexed && not indexed params
 */
export function decodeEventABI(data) {
  var event = this;

  data.data = data.data || '';
  data.topics = data.topics || [];
  var result = formatters.outputLogFormatter(data);

  // if allEvents get the right event
  if (event.name === 'ALLEVENTS') {
    event = event.jsonInterface.find(function(intf) {
      return intf.signature === data.topics[0];
    }) || { anonymous: true };
  }

  // create empty inputs if none are present (e.g. anonymous events on allEvents)
  event.inputs = event.inputs || [];

  var argTopics = event.anonymous ? data.topics : data.topics.slice(1);

  result.returnValues = abi.decodeLog(event.inputs, data.data, argTopics);
  delete result.returnValues.__length__;

  // add name
  result.event = event.name;

  // add signature
  result.signature = event.anonymous || !data.topics[0] ? null : data.topics[0];

  // move the data and topics to "raw"
  result.raw = {
    data: result.data,
    topics: result.topics,
  };
  delete result.data;
  delete result.topics;

  return result;
}
