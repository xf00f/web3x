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

import { isNumber, isString } from 'util';
import { Address } from '../address';
import { Data, TransactionHash } from '../types';
import { hexToNumber, numberToHex, sha3 } from '../utils';

export interface RawLogResponse {
  id?: string;
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

// TODO: Make blockHash, transactionHash and topics be Buffers
export interface LogResponse {
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

export function fromRawLogResponse(log: RawLogResponse): LogResponse {
  let id: string | null = log.id || null;

  // Generate a custom log id.
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
  const address = isString(log.address) ? Address.fromString(log.address) : log.address;

  return { ...log, id, blockNumber, transactionIndex, logIndex, address };
}

export function toRawLogResponse(log: LogResponse): RawLogResponse {
  const { id, blockNumber, transactionIndex, logIndex, address } = log;
  return {
    ...log,
    id: id ? id : undefined,
    blockNumber: isNumber(blockNumber) ? numberToHex(blockNumber) : null,
    transactionIndex: isNumber(transactionIndex) ? numberToHex(transactionIndex) : null,
    logIndex: isNumber(logIndex) ? numberToHex(logIndex) : null,
    address: address.toString().toLowerCase(),
  };
}
