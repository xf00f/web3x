import { sha3, toChecksumAddress, hexToNumber } from '../../utils';

/**
 * Formats the output of a log
 *
 * @method outputLogFormatter
 * @param {Object} log object
 * @returns {Object} log
 */
export function outputLogFormatter(log) {
  // generate a custom log id
  if (
    typeof log.blockHash === 'string' &&
    typeof log.transactionHash === 'string' &&
    typeof log.logIndex === 'string'
  ) {
    var shaId = sha3(
      log.blockHash.replace('0x', '') + log.transactionHash.replace('0x', '') + log.logIndex.replace('0x', '')
    );
    log.id = 'log_' + shaId.replace('0x', '').substr(0, 8);
  } else if (!log.id) {
    log.id = null;
  }

  if (log.blockNumber !== null) log.blockNumber = hexToNumber(log.blockNumber);
  if (log.transactionIndex !== null) log.transactionIndex = hexToNumber(log.transactionIndex);
  if (log.logIndex !== null) log.logIndex = hexToNumber(log.logIndex);

  if (log.address) {
    log.address = toChecksumAddress(log.address);
  }

  return log;
}
