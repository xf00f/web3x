import { inputBlockNumberFormatter } from './input-block-number-formatter';

export function inputDefaultBlockNumberFormatter(blockNumber) {
  if (this && (blockNumber === undefined || blockNumber === null)) {
    return inputBlockNumberFormatter(this.defaultBlock);
  }
  if (blockNumber === 'genesis' || blockNumber === 'earliest') {
    return '0x0';
  }
  return inputBlockNumberFormatter(blockNumber);
}
