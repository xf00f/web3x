/*
  This file is part of web3x.

  web3x is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  web3x is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License
  along with web3x.  If not, see <http://www.gnu.org/licenses/>.
*/

import { isBoolean } from 'util';
import { hexToNumber } from '../utils';

export interface Sync {
  startingBlock: number;
  currentBlock: number;
  highestBlock: number;
  knownStates: number;
  pulledStated: number;
}

export function outputSyncingFormatter(result): Sync | boolean {
  if (isBoolean(result)) {
    return result;
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
