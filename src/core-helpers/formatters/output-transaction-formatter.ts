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
