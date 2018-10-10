import { toChecksumAddress, hexToNumber } from '../../utils';
import { outputLogFormatter } from './output-log-formatter';
import { isArray } from 'util';

/**
 * Formats the output of a transaction receipt to its proper values
 *
 * @method outputTransactionReceiptFormatter
 * @param {Object} receipt
 * @returns {Object}
 */
export function outputTransactionReceiptFormatter(receipt) {
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
