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

import { toChecksumAddress, hexToNumber } from '../utils';
import { outputLogFormatter, Log } from './output-log-formatter';
import { isArray } from 'util';

export interface TransactionReceipt<Events = void> {
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  blockNumber: number;
  from: string;
  to: string;
  contractAddress: string;
  cumulativeGasUsed: number;
  gasUsed: number;
  logs?: Log[];
  events?: Events extends void ? { [eventName: string]: EventLog<any>[] } : Events;
  unnamedEvents?: EventLog<any>[];
  status: string;
}

export interface EventLog<ReturnValues> {
  id: string | null;
  removed?: boolean;
  event?: string;
  address: string;
  returnValues: ReturnValues;
  logIndex: number | null;
  transactionIndex: number | null;
  transactionHash: string | null;
  blockHash: string | null;
  blockNumber: number | null;
  raw: { data: string; topics: string[] };
  signature: string | null;
}

/**
 * Formats the output of a transaction receipt to its proper values
 *
 * @method outputTransactionReceiptFormatter
 * @param {Object} receipt
 * @returns {Object}
 */
export function outputTransactionReceiptFormatter(receipt) {
  if (!receipt) {
    return null;
  }
  if (typeof receipt !== 'object') {
    throw new Error('Received receipt is invalid: ' + receipt);
  }

  if (receipt.blockNumber !== null) receipt.blockNumber = hexToNumber(receipt.blockNumber);
  if (receipt.transactionIndex !== null) receipt.transactionIndex = hexToNumber(receipt.transactionIndex);
  receipt.cumulativeGasUsed = hexToNumber(receipt.cumulativeGasUsed);
  receipt.gasUsed = hexToNumber(receipt.gasUsed);

  if (isArray(receipt.logs)) {
    receipt.logs = receipt.logs.map(outputLogFormatter);
  }

  if (receipt.contractAddress) {
    receipt.contractAddress = toChecksumAddress(receipt.contractAddress);
  }

  if (typeof receipt.status !== 'undefined') {
    receipt.status = Boolean(parseInt(receipt.status));
  }

  return receipt;
}
