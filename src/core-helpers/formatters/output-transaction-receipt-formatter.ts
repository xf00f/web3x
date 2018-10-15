import { toChecksumAddress, hexToNumber } from '../../utils';
import { outputLogFormatter, Log } from './output-log-formatter';
import { isArray } from 'util';

export interface TransactionReceipt {
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
  events?: {
    [eventName: string]: EventLog;
  };
  status: string;
}

export interface EventLog {
  id: string | null;
  removed?: boolean;
  event?: string;
  address: string;
  returnValues: any;
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
