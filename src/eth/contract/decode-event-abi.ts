import { abi } from '../abi';
import { AbiDefinition, ContractAbi } from './contract-abi';
import { outputLogFormatter, UnformattedLog } from '../../core-helpers/formatters/output-log-formatter';

export interface EventLog {
  id: string | null;
  removed?: boolean;
  event?: string;
  address: string;
  returnValues: any;
  logIndex: number | null;
  transactionIndex: number | null;
  transactionHash: string | null;
  blockHash: string | null;
  blockNumber: number | null;
  raw: { data: string; topics: string[] };
  signature: string | null;
}

export function decodeAnyEvent(contractAbi: ContractAbi, data: UnformattedLog) {
  const anonymousEvent: AbiDefinition = {
    type: 'event',
    anonymous: true,
    inputs: [],
  };
  const event = contractAbi.find(abiDef => abiDef.signature === data.topics[0]) || anonymousEvent;
  return decodeEventABI(event, data);
}

/**
 * Should be used to decode indexed params and options
 *
 * @method _decodeEventABI
 * @param {Object} input
 * @return {Object} result object with decoded indexed && not indexed params
 */
export function decodeEventABI(event: AbiDefinition, input: UnformattedLog): EventLog {
  input.data = input.data || '';
  input.topics = input.topics || [];

  const argTopics = event.anonymous ? input.topics : input.topics.slice(1);
  const returnValues = abi.decodeLog(event.inputs, input.data, argTopics);
  delete returnValues.__length__;

  const { data, topics, ...formattedLog } = outputLogFormatter(input);
  console.log(formattedLog);

  return {
    ...formattedLog,
    event: event.name,
    returnValues,
    signature: event.anonymous || !input.topics[0] ? null : input.topics[0],
    raw: {
      data,
      topics,
    },
  };
}
