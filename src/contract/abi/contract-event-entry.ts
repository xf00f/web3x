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
import { EventLog, LogResponse } from '../../formatters';
import { abiCoder } from '../abi-coder';
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

  public decodeEvent(log: LogResponse): EventLog<any> {
    const { data = '', topics = [], ...formattedLog } = log;
    const { anonymous, inputs = [], name = '' } = this.entry;

    const argTopics = anonymous ? topics : topics.slice(1);
    const returnValues = abiCoder.decodeLog(inputs, data, argTopics);
    delete returnValues.__length__;

    return {
      ...formattedLog,
      event: name,
      returnValues,
      signature: anonymous || !topics[0] ? null : topics[0],
      raw: {
        data,
        topics,
      },
    };
  }
}
