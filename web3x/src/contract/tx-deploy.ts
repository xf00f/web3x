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
import { Eth, SendTx } from '../eth';
import { ContractAbi, ContractFunctionEntry } from './abi';
import { SentDeployContractTx } from './sent-deploy-contract-tx';
import { DefaultOptions, SendOptions, Tx } from './tx';

export class TxDeploy extends Tx {
  constructor(
    eth: Eth,
    contractEntry: ContractFunctionEntry,
    contractAbi: ContractAbi,
    private deployData: Buffer,
    args: any[] = [],
    defaultOptions: DefaultOptions = {},
    private onDeployed: (address: Address) => void = x => x,
  ) {
    super(eth, contractEntry, contractAbi, undefined, args, defaultOptions);
  }

  public send(options: SendOptions): SendTx {
    const sentTx = super.send(options);
    return new SentDeployContractTx(this.eth, this.contractAbi, sentTx.getTxHash(), this.onDeployed);
  }

  public encodeABI() {
    return Buffer.concat([this.deployData, this.contractEntry.encodeParameters(this.args)]);
  }
}
