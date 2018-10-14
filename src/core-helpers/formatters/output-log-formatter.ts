import { sha3, toChecksumAddress, hexToNumber } from '../../utils';
import { TransactionHash, Address, Data } from '../../types';

export interface UnformattedLog {
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

export interface FormattedLog {
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

/**
 * Formats the output of a log
 *
 * @method outputLogFormatter
 * @param {Object} log object
 * @returns {Object} log
 */
export function outputLogFormatter(log: UnformattedLog | FormattedLog): FormattedLog {
  let id: string | null = log['id'] || null;

  // generate a custom log id
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
  const address = toChecksumAddress(log.address);

  return { ...log, id, blockNumber, transactionIndex, logIndex, address };
}
