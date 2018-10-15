import { hexToNumber } from '../../utils';

export interface Sync {
  startingBlock: number;
  currentBlock: number;
  highestBlock: number;
  knownStates: number;
  pulledStated: number;
}

export function outputSyncingFormatter(result): Sync | boolean {
  if (result === false) {
    return false;
  }
  result.startingBlock = hexToNumber(result.startingBlock);
  result.currentBlock = hexToNumber(result.currentBlock);
  result.highestBlock = hexToNumber(result.highestBlock);
  if (result.knownStates) {
    result.knownStates = hexToNumber(result.knownStates);
    result.pulledStates = hexToNumber(result.pulledStates);
  }

  return result;
}
