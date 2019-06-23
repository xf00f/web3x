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
import { Address } from '../address';
import { BlockType } from '../eth';
import { hexToNumber, hexToNumberString, hexToUtf8, utf8ToHex } from '../utils';
import { inputBlockNumberFormatter } from './input-block-number-formatter';

export interface LogRequest {
  filter?: { [k: string]: any };
  toBlock?: BlockType;
  fromBlock?: BlockType;
  address?: Address | Address[];
  topics?: (string | string[] | null)[];
}

export interface RawLogRequest {
  toBlock?: string;
  fromBlock?: string;
  address?: string | string[];
  topics?: (string | string[])[];
}

export function toRawLogRequest(logRequest: LogRequest = {}): RawLogRequest {
  const rawLogRequest: RawLogRequest = {};

  if (logRequest.fromBlock !== undefined) {
    rawLogRequest.fromBlock = inputBlockNumberFormatter(logRequest.fromBlock);
  }

  if (logRequest.toBlock !== undefined) {
    rawLogRequest.toBlock = inputBlockNumberFormatter(logRequest.toBlock);
  }

  // Convert topics to hex.
  rawLogRequest.topics = (logRequest.topics || []).map(topic => {
    const toTopic = value => {
      if (value === null || typeof value === 'undefined') {
        return null;
      }
      value = String(value);
      return value.indexOf('0x') === 0 ? value : utf8ToHex(value);
    };
    return isArray(topic) ? topic.map(toTopic) : toTopic(topic);
  });

  if (logRequest.address) {
    rawLogRequest.address = isArray(logRequest.address)
      ? logRequest.address.map(a => a.toString().toLowerCase())
      : logRequest.address.toString().toLowerCase();
  }

  return rawLogRequest;
}

export function fromRawLogRequest(rawLogRequest: RawLogRequest): LogRequest {
  const { toBlock, fromBlock, address, topics } = rawLogRequest;
  return {
    toBlock: toBlock ? hexToNumber(toBlock) : undefined,
    fromBlock: fromBlock ? hexToNumber(fromBlock) : undefined,
    address: address ? (isArray(address) ? address.map(Address.fromString) : Address.fromString(address)) : undefined,
    topics,
  };
}
