import { hexToNumber } from '../../utils';

export function outputSyncingFormatter(result) {
  result.startingBlock = hexToNumber(result.startingBlock);
  result.currentBlock = hexToNumber(result.currentBlock);
  result.highestBlock = hexToNumber(result.highestBlock);
  if (result.knownStates) {
    result.knownStates = hexToNumber(result.knownStates);
    result.pulledStates = hexToNumber(result.pulledStates);
  }

  return result;
}
