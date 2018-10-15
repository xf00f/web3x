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

import { toChecksumAddress, isAddress, hexToNumber } from '../../utils';
import { outputBigNumberFormatter } from './output-big-number-formatter';

export interface UnformattedTransaction {
  blockHash: string | null;
  blockNumber: string | null;
  from: string;
  gas: string;
  gasPrice: string;
  hash: string;
  input: string;
  nonce: string;
  to: string | null;
  transactionIndex: string | null;
  value: string;
  v: string;
  r: string;
  s: string;
}

export interface Transaction {
  blockHash: string | null;
  blockNumber: number | null;
  from: string;
  gas: number;
  gasPrice: string;
  hash: string;
  input: string;
  nonce: number;
  to: string | null;
  transactionIndex: number | null;
  value: string;
  v: string;
  r: string;
  s: string;
}

/**
 * Formats the output of a transaction to its proper values
 *
 * @method outputTransactionFormatter
 * @param {Object} tx
 * @returns {Object}
 */
export function outputTransactionFormatter(tx: UnformattedTransaction): Transaction {
  return {
    ...tx,
    blockNumber: tx.blockNumber ? hexToNumber(tx.blockNumber) : null,
    transactionIndex: tx.transactionIndex ? hexToNumber(tx.transactionIndex) : null,
    nonce: hexToNumber(tx.nonce)!,
    gas: hexToNumber(tx.gas)!,
    gasPrice: outputBigNumberFormatter(tx.gasPrice),
    value: outputBigNumberFormatter(tx.value),
    to: tx.to && isAddress(tx.to) ? toChecksumAddress(tx.to) : null,
    from: toChecksumAddress(tx.from),
  };
}
