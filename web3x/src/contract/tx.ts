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
import { BlockType, Eth } from '../eth';
import { SendTx } from '../eth/send-tx';
import { TransactionReceipt } from '../formatters';
import { ContractAbi, ContractFunctionEntry } from './abi';
import { SentContractTx } from './sent-contract-tx';

export type TxFactory = (...args: any[]) => Tx;

export interface CallOptions {
  from?: Address;
  gasPrice?: string | number;
  gas?: number;
}

export interface SendOptions {
  from?: Address;
  gasPrice?: string | number;
  gas?: number;
  value?: number | string;
  nonce?: number | string;
}

export interface EstimateOptions {
  from?: Address;
  gas?: string | number;
  gasPrice?: string | number;
  value?: number | string;
}

export type DefaultOptions = {
  from?: Address;
  gasPrice?: string | number;
  gas?: number;
};

export interface TxCall<Return = any> {
  call(options?: CallOptions, block?: BlockType): Promise<Return>;
  getCallRequestPayload(options?: CallOptions, block?: number);
  estimateGas(options?: EstimateOptions): Promise<number>;
  encodeABI(): Buffer;
}

export interface TxSend<TxReceipt = TransactionReceipt> {
  send(options?: SendOptions): SendTx<TxReceipt>;
  getSendRequestPayload(options?: SendOptions);
  estimateGas(options?: EstimateOptions): Promise<number>;
  encodeABI(): Buffer;
}

export class Tx implements TxCall, TxSend {
  constructor(
    protected eth: Eth,
    protected contractEntry: ContractFunctionEntry,
    protected contractAbi: ContractAbi,
    protected contractAddress?: Address,
    protected args: any[] = [],
    protected defaultOptions: DefaultOptions = {},
  ) {}

  public async estimateGas(options: EstimateOptions = {}) {
    return await this.eth.estimateGas(this.getTx(options));
  }

  public async call(options: CallOptions = {}, block?: BlockType) {
    const result = await this.eth.call(this.getTx(options), block);
    return this.contractEntry.decodeReturnValue(result);
  }

  public getCallRequestPayload(options: CallOptions, block?: number) {
    const result = this.eth.request.call(this.getTx(options), block);
    return {
      ...result,
      format: (result: string) => this.contractEntry.decodeReturnValue(result),
    };
  }

  public send(options: SendOptions): SendTx {
    const tx = this.getTx(options);

    if (!this.contractEntry.payable && tx.value !== undefined && tx.value > 0) {
      throw new Error('Can not send value to non-payable contract method.');
    }

    const promise = this.eth.sendTransaction(tx).getTxHash();

    return new SentContractTx(this.eth, this.contractAbi, promise);
  }

  public getSendRequestPayload(options: SendOptions) {
    return this.eth.request.sendTransaction(this.getTx(options));
  }

  public encodeABI() {
    return this.contractEntry.encodeABI(this.args);
  }

  private getTx(options: any = {}): any {
    return {
      to: this.contractAddress,
      from: options.from || this.defaultOptions.from,
      gasPrice: options.gasPrice || this.defaultOptions.gasPrice,
      gas: options.gas || this.defaultOptions.gas,
      value: options.value,
      data: this.encodeABI(),
      nonce: options.nonce,
    };
  }
}
