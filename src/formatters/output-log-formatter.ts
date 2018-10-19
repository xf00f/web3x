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

import { sha3, toChecksumAddress, hexToNumber } from '../utils';
import { TransactionHash, Address, Data } from '../types';

export interface UnformattedLog {
  removed?: boolean;
  logIndex: string | null;
  blockNumber: string | null;
  blockHash: string | null;
  transactionHash: string | null;
  transactionIndex: string | null;
  address: string;
  data: string;
  topics: string[];
}

export interface Log {
  id: string | null;
  removed?: boolean;
  logIndex: number | null;
  blockNumber: number | null;
  blockHash: string | null;
  transactionHash: TransactionHash | null;
  transactionIndex: number | null;
  address: Address;
  data: Data;
  topics: string[];
}

/**
 * Formats the output of a log
 *
 * @method outputLogFormatter
 * @param {Object} log object
 * @returns {Object} log
 */
export function outputLogFormatter(log: UnformattedLog | Log): Log {
  let id: string | null = log['id'] || null;

  // generate a custom log id
  if (
    typeof log.blockHash === 'string' &&
    typeof log.transactionHash === 'string' &&
    typeof log.logIndex === 'string'
  ) {
    const shaId = sha3(
      log.blockHash.replace('0x', '') + log.transactionHash.replace('0x', '') + log.logIndex.replace('0x', ''),
    );
    id = 'log_' + shaId.replace('0x', '').substr(0, 8);
  }

  const blockNumber = log.blockNumber !== null ? hexToNumber(log.blockNumber) : null;
  const transactionIndex = log.transactionIndex !== null ? hexToNumber(log.transactionIndex) : null;
  const logIndex = log.logIndex !== null ? hexToNumber(log.logIndex) : null;
  const address = toChecksumAddress(log.address);

  return { ...log, id, blockNumber, transactionIndex, logIndex, address };
}
