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

import { isArray } from 'util';
import { Address } from '../address';
import { BlockType, Eth } from '../eth';
import { SendTransaction, SendTx } from '../eth/send-tx';
import { TransactionReceipt } from '../formatters';
import { ContractAbi, ContractFunctionEntry } from './abi';

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
}

interface EstimateOptions {
  from?: Address;
  gas?: string | number;
  gasPrice?: string | number;
  value?: number | string;
}

type DefaultOptions = {
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
    private eth: Eth,
    private contractEntry: ContractFunctionEntry,
    private contractAbi: ContractAbi,
    private contractAddress: Address,
    private args: any[] = [],
    private defaultOptions: DefaultOptions = {},
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

    if (!this.contractEntry.payable && tx.value > 0) {
      throw new Error('Can not send value to non-payable contract method.');
    }

    return new SendContractTx(this.eth, tx, this.contractAbi);
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
    };
  }
}

export class SendContractTx extends SendTransaction {
  constructor(eth: Eth, tx: any, private contractAbi: ContractAbi) {
    super(eth, tx);
  }

  protected async handleReceipt(receipt: TransactionReceipt) {
    receipt = await super.handleReceipt(receipt);

    if (!isArray(receipt.logs)) {
      return receipt;
    }

    const decodedEvents = receipt.logs.map(log => this.contractAbi.decodeAnyEvent(log));

    receipt.events = {};
    receipt.unnamedEvents = [];
    for (const ev of decodedEvents) {
      if (ev.event) {
        const events = receipt.events[ev.event] || [];
        receipt.events[ev.event] = [...events, ev];
      } else {
        receipt.unnamedEvents = [...receipt.unnamedEvents, ev];
      }
    }
    delete receipt.logs;

    return receipt;
  }
}
