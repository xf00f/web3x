import { isArray } from 'util';
import { EventLog, Log } from '../../formatters';
import { abiCoder } from '../abi-coder';
import { decodeEvent } from '../decode-event-abi';
import { ContractEntryDefinition } from './contract-abi-definition';
import { ContractEntry } from './contract-entry';

export class ContractEventEntry extends ContractEntry {
  public readonly signature: string;

  constructor(entry: ContractEntryDefinition) {
    super(entry);
    this.signature = abiCoder.encodeEventSignature(abiCoder.abiMethodToString(entry));
  }

  public getEventTopics(filter: object = {}) {
    const topics: (string | string[])[] = [];

    if (!this.entry.anonymous && this.signature) {
      topics.push(this.signature);
    }

    const indexedTopics = (this.entry.inputs || [])
      .filter(input => input.indexed === true)
      .map(input => {
        const value = filter[input.name];
        if (!value) {
          return null;
        }

        // TODO: https://github.com/ethereum/web3.js/issues/344
        // TODO: deal properly with components

        if (isArray(value)) {
          return value.map(v => abiCoder.encodeParameter(input.type, v));
        } else {
          return abiCoder.encodeParameter(input.type, value);
        }
      });

    return [...topics, ...indexedTopics];
  }

  public decodeEvent(log: Log): EventLog<any> {
    return decodeEvent(this.entry, log);
  }
}
