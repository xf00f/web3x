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
