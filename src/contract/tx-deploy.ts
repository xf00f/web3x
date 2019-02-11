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
import { hexToBuffer } from '../utils';
import { ContractAbi, ContractFunctionEntry } from './abi';
import { SentDeployContractTx } from './sent-deploy-contract-tx';
import { TxSend } from './tx';

interface SendOptions {
  from?: Address;
  gasPrice?: string | number;
  gas?: number;
  value?: number | string;
}

interface EstimateOptions {
  from?: Address;
  gasPrice?: string;
  value?: number | string;
}

type DefaultOptions = {
  from?: Address;
  gasPrice?: string;
  gas?: number;
};

export class TxDeploy implements TxSend {
  constructor(
    private eth: Eth,
    private contractEntry: ContractFunctionEntry,
    private contractAbi: ContractAbi,
    private deployData: string,
    private args: any[] = [],
    private defaultOptions: DefaultOptions = {},
    private onDeployed: (address: Address) => void,
  ) {}

  public async estimateGas(options: EstimateOptions = {}) {
    return await this.eth.estimateGas(this.getTx(options));
  }

  public send(options: SendOptions): SendTx {
    const tx = this.getTx(options);

    if (!this.contractEntry.payable && tx.value > 0) {
      throw new Error('Can not send value to non-payable constructor.');
    }

    const promise = this.eth.sendTransaction(tx).getTxHash();

    return new SentDeployContractTx(this.eth, this.contractAbi, promise, this.onDeployed);
  }

  public getSendRequestPayload(options: SendOptions) {
    return this.eth.request.sendTransaction(this.getTx(options));
  }

  private getTx(options) {
    return {
      from: options.from || this.defaultOptions.from,
      gasPrice: options.gasPrice || this.defaultOptions.gasPrice,
      gas: options.gas || this.defaultOptions.gas,
      value: options.value,
      data: this.encodeABI(),
    };
  }

  public encodeABI() {
    return hexToBuffer(this.deployData + this.contractEntry.encodeParameters(this.args).replace('0x', ''));
  }
}
