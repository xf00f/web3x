/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { ContractAbiDefinition } from 'web3x/contract';
import { ContractConfig } from './config';
import { getFromEtherscan } from './source-etherscan';
import { getFromFiles } from './source-files';
import { getFromTruffle } from './source-truffle';

export interface ContractBuildData {
  abi: ContractAbiDefinition;
  initData?: string;
}

export async function loadDataFromConfig(contract: ContractConfig): Promise<ContractBuildData> {
  switch (contract.source) {
    case 'etherscan':
      return await getFromEtherscan(contract.net, contract.address);
    case 'files':
      return getFromFiles(contract.abiFile, contract.initDataFile);
    case 'truffle':
      return getFromTruffle(contract.buildFile);
    case 'inline':
      return { abi: contract.abi, initData: contract.initData };
  }
}
