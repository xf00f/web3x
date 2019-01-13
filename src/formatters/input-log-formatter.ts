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
import { utf8ToHex } from '../utils';
import { inputBlockNumberFormatter } from './input-block-number-formatter';

export interface GetLogOptions {
  filter?: { [k: string]: any };
  toBlock?: BlockType;
  fromBlock?: BlockType;
  address?: Address | Address[];
  topics?: (string | string[] | null)[];
}

export interface FormattedGetLogOptions {
  toBlock?: string;
  fromBlock?: string;
  address?: string | string[];
  topics?: (string | string[])[];
}

/**
 * Formats the input of a log
 *
 * @method inputLogFormatter
 * @param {Object} log object
 * @returns {Object} log
 */
export function inputLogFormatter(options: GetLogOptions = {}): FormattedGetLogOptions {
  const formattedLogOptions: FormattedGetLogOptions = {};

  if (options.fromBlock !== undefined) {
    formattedLogOptions.fromBlock = inputBlockNumberFormatter(options.fromBlock);
  }

  if (options.toBlock !== undefined) {
    formattedLogOptions.toBlock = inputBlockNumberFormatter(options.toBlock);
  }

  // Convert topics to hex.
  formattedLogOptions.topics = (options.topics || []).map(topic => {
    const toTopic = value => {
      if (value === null || typeof value === 'undefined') {
        return null;
      }
      value = String(value);
      return value.indexOf('0x') === 0 ? value : utf8ToHex(value);
    };
    return isArray(topic) ? topic.map(toTopic) : toTopic(topic);
  });

  if (options.address) {
    formattedLogOptions.address = isArray(options.address)
      ? options.address.map(a => a.toString().toLowerCase())
      : options.address.toString().toLowerCase();
  }

  return formattedLogOptions;
}