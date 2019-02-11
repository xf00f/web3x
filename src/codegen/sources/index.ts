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

import { ContractAbiDefinition } from '../../contract';
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
