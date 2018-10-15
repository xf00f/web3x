import { isHexStrict, numberToHex } from '../../utils';
import { isString } from 'util';

export function inputBlockNumberFormatter(blockNumber) {
  if (blockNumber === undefined) {
    return undefined;
  } else if (blockNumber === 'genesis' || blockNumber === 'earliest') {
    return '0x0';
  } else if (blockNumber === 'latest' || blockNumber === 'pending') {
    return blockNumber;
  }
  return isHexStrict(blockNumber)
    ? isString(blockNumber)
      ? blockNumber.toLowerCase()
      : blockNumber
    : numberToHex(blockNumber);
}
