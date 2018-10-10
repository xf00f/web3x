import { toChecksumAddress, isAddress, hexToNumber } from '../../utils';
import { outputBigNumberFormatter } from './output-big-number-formatter';

/**
 * Formats the output of a transaction to its proper values
 *
 * @method outputTransactionFormatter
 * @param {Object} tx
 * @returns {Object}
 */
export function outputTransactionFormatter(tx) {
  if (tx.blockNumber !== null) tx.blockNumber = hexToNumber(tx.blockNumber);
  if (tx.transactionIndex !== null) tx.transactionIndex = hexToNumber(tx.transactionIndex);
  tx.nonce = hexToNumber(tx.nonce);
  tx.gas = hexToNumber(tx.gas);
  tx.gasPrice = outputBigNumberFormatter(tx.gasPrice);
  tx.value = outputBigNumberFormatter(tx.value);

  if (tx.to && isAddress(tx.to)) {
    // tx.to could be `0x0` or `null` while contract creation
    tx.to = toChecksumAddress(tx.to);
  } else {
    tx.to = null; // set to `null` if invalid address
  }

  if (tx.from) {
    tx.from = toChecksumAddress(tx.from);
  }

  return tx;
}
