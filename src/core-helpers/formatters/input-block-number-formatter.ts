import { isHexStrict, numberToHex } from '../../utils';
import { isString } from 'util';

export function isPredefinedBlockNumber(blockNumber) {
  return blockNumber === 'latest' || blockNumber === 'pending' || blockNumber === 'earliest';
}

export function inputBlockNumberFormatter(blockNumber) {
  if (blockNumber === undefined) {
    return undefined;
  } else if (isPredefinedBlockNumber(blockNumber)) {
    return blockNumber;
  }
  return isHexStrict(blockNumber)
    ? isString(blockNumber)
      ? blockNumber.toLowerCase()
      : blockNumber
    : numberToHex(blockNumber);
}
