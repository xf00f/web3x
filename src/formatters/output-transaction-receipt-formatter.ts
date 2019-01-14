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

import { isArray, isString } from 'util';
import { Address } from '../address';
import { hexToNumber } from '../utils';
import { Log, outputLogFormatter, UnformattedLog } from './output-log-formatter';

export interface UnformattedTransactionReceipt {
  transactionHash: string;
  transactionIndex: string;
  blockHash: string;
  blockNumber: string;
  from: string;
  to?: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  contractAddress?: string;
  logs?: UnformattedLog[];
  status?: string;
}

export interface EventLog<ReturnValues, Name = string> {
  id: string | null;
  removed?: boolean;
  event?: Name;
  address: Address;
  returnValues: ReturnValues;
  logIndex: number | null;
  transactionIndex: number | null;
  transactionHash: string | null;
  blockHash: string | null;
  blockNumber: number | null;
  raw: { data: string; topics: string[] };
  signature: string | null;
}

export interface TransactionReceipt<Events = void> {
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  blockNumber: number;
  from: Address;
  to?: Address;
  cumulativeGasUsed: number;
  gasUsed: number;
  contractAddress?: Address;
  logs?: Log[];
  events?: Events extends void ? { [eventName: string]: EventLog<any>[] } : Events;
  unnamedEvents?: EventLog<any>[];
  status?: boolean;
}

/**
 * Formats the output of a transaction receipt to its proper values
 *
 * @method outputTransactionReceiptFormatter
 * @param {Object} receipt
 * @returns {Object}
 */
export function outputTransactionReceiptFormatter(receipt?: UnformattedTransactionReceipt): TransactionReceipt | null {
  if (!receipt || !receipt.blockHash) {
    return null;
  }

  if (typeof receipt !== 'object') {
    throw new Error('Received receipt is invalid: ' + receipt);
  }

  return {
    ...receipt,
    to: receipt.to ? Address.fromString(receipt.to) : undefined,
    from: Address.fromString(receipt.from),
    blockNumber: hexToNumber(receipt.blockNumber)!,
    transactionIndex: hexToNumber(receipt.transactionIndex)!,
    cumulativeGasUsed: hexToNumber(receipt.cumulativeGasUsed)!,
    gasUsed: hexToNumber(receipt.gasUsed)!,
    logs: isArray(receipt.logs) ? receipt.logs.map(outputLogFormatter) : undefined,
    contractAddress: receipt.contractAddress ? Address.fromString(receipt.contractAddress) : undefined,
    status: isString(receipt.status) ? Boolean(hexToNumber(receipt.status)) : undefined,
  };
}
