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

import { Address } from '../address';
import { Eth } from '../eth';
import { TransactionReceipt } from '../formatters';
import { TransactionHash } from '../types';
import { ContractAbi } from './abi';
import { Contract } from './contract';
import { SentContractTx } from './sent-contract-tx';

export class SentDeployContractTx extends SentContractTx {
  constructor(
    eth: Eth,
    contractAbi: ContractAbi,
    promise: Promise<TransactionHash>,
    private onDeployed: (address: Address) => void,
  ) {
    super(eth, contractAbi, promise);
  }

  protected async handleReceipt(receipt: TransactionReceipt) {
    receipt = await super.handleReceipt(receipt);

    if (!receipt.contractAddress) {
      throw new Error('The contract deployment receipt did not contain a contract address.');
    }

    const code = await this.eth.getCode(receipt.contractAddress);
    if (code.length <= 2) {
      throw new Error(`Contract code could not be stored at ${receipt.contractAddress}.`);
    }

    this.onDeployed(receipt.contractAddress);

    return receipt;
  }

  public async getContract() {
    const receipt = await this.getReceipt();
    return new Contract(this.eth, this.contractAbi, receipt.contractAddress);
  }
}
