/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import fs from 'fs';
import { ContractAbiDefinition } from 'web3x/contract/abi';

export function getFromFiles(abiFile: string, initDataFile?: string) {
  const abi: ContractAbiDefinition = JSON.parse(fs.readFileSync(abiFile).toString());

  if (initDataFile) {
    const initData = fs.readFileSync(initDataFile).toString();
    return { abi, initData };
  }

  return { abi };
}
