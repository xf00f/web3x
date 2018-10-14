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

/**
 * Decodes any event log response and its return values.
 *
 * @param contractAbi Abi definition of the contract to which the event belongs.
 * @param log The log response to decode.
 * @returns The decoded event log.
 */
export function decodeAnyEvent(contractAbi: ContractAbi, data: UnformattedLog) {
  const anonymousEvent: AbiDefinition = {
    type: 'event',
    anonymous: true,
    inputs: [],
  };
  const event = contractAbi.find(abiDef => abiDef.signature === data.topics[0]) || anonymousEvent;
  return decodeEvent(event, data);
}

/**
 * Decodes an event log response and its return values.
 *
 * @param event Abi definition of event.
 * @param log The log response to decode.
 * @returns The decoded event log.
 */
export function decodeEvent(event: AbiDefinition, log: UnformattedLog): EventLog {
  log.data = log.data || '';
  log.topics = log.topics || [];

  const argTopics = event.anonymous ? log.topics : log.topics.slice(1);
  const returnValues = abi.decodeLog(event.inputs, log.data, argTopics);
  delete returnValues.__length__;

  const { data, topics, ...formattedLog } = outputLogFormatter(log);
  console.log(formattedLog);

  return {
    ...formattedLog,
    event: event.name,
    returnValues,
    signature: event.anonymous || !log.topics[0] ? null : log.topics[0],
    raw: {
      data,
      topics,
    },
  };
}
