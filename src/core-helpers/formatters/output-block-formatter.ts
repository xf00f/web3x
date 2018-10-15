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

import { toChecksumAddress, hexToNumber } from '../../utils';
import { outputBigNumberFormatter } from './output-big-number-formatter';
import { outputTransactionFormatter } from './output-transaction-formatter';
import { isString, isArray } from 'util';

/**
 * Formats the output of a block to its proper values
 *
 * @method outputBlockFormatter
 * @param {Object} block
 * @returns {Object}
 */
export function outputBlockFormatter(block) {
  // transform to number
  block.gasLimit = hexToNumber(block.gasLimit);
  block.gasUsed = hexToNumber(block.gasUsed);
  block.size = hexToNumber(block.size);
  block.timestamp = hexToNumber(block.timestamp);
  if (block.number !== null) block.number = hexToNumber(block.number);

  if (block.difficulty) block.difficulty = outputBigNumberFormatter(block.difficulty);
  if (block.totalDifficulty) block.totalDifficulty = outputBigNumberFormatter(block.totalDifficulty);

  if (isArray(block.transactions)) {
    block.transactions.forEach(function(item) {
      if (!isString(item)) return outputTransactionFormatter(item);
    });
  }

  if (block.miner) block.miner = toChecksumAddress(block.miner);

  return block;
}
