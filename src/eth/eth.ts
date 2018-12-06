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

import { Subscription } from '../subscriptions';
import { Contract, ContractAbi, ContractOptions } from '../contract';
import { Accounts, Wallet } from '../accounts';
import { IRequestManager, BatchManager } from '../request-manager';
import { fireError } from '../utils';
import {
  outputSyncingFormatter,
  outputBlockFormatter,
  inputLogFormatter,
  outputLogFormatter,
  Sync,
  Transaction,
  TransactionReceipt,
  Log,
} from '../formatters';
import { isFunction } from 'util';
import { Tx, BlockType, BlockHash, TransactionHash } from '../types';
import { Callback, Data, Address, Quantity } from '../types';
import { PromiEvent, promiEvent, PromiEventResult } from '../promievent';
import { confirmTransaction } from './confirm-transaction';
import { EthRequestPayloads } from './eth-request-payloads';
import { Block, BlockHeader } from './block';
import { RequestManager } from '../request-manager';
import { Provider } from '../providers';
import { Personal } from '../personal';
import { Net } from '../net';

export interface LogsSubscriptionOptions {
  fromBlock?: number;
  address?: string;
  topics?: Array<string | string[]>;
}

export interface SignedTransaction {
  raw: string;
  tx: {
    nonce: string;
    gasPrice: string;
    gas: string;
    to: string;
    value: string;
    input: string;
    v: string;
    r: string;
    s: string;
    hash: string;
  };
}

export interface SendTxPromiEvent<TxReceipt = TransactionReceipt> extends PromiEvent<TxReceipt> {
  once(type: 'transactionHash', handler: (transactionHash: string) => void): this;
  once(type: 'receipt', handler: (receipt: TxReceipt) => void): this;
  once(type: 'confirmation', handler: (confNumber: number, receipt: TxReceipt) => void): this;
  once(type: 'error', handler: (error: Error) => void): this;
  on(type: 'transactionHash', handler: (transactionHash: string) => void): this;
  on(type: 'receipt', handler: (receipt: TxReceipt) => void): this;
  on(type: 'confirmation', handler: (confNumber: number, receipt: TxReceipt) => void): this;
  on(type: 'error', handler: (error: Error) => void): this;
}

export class Eth {
  readonly request: EthRequestPayloads;

  // Following are injected by Web3 for api backwards compatability, but gross.
  public accounts!: Accounts;
  public wallet?: Wallet;
  public personal!: Personal;
  public net!: Net;
  public Contract!: new (abi: ContractAbi, address?: string, options?: ContractOptions) => Contract;
  public BatchRequest!: new () => BatchManager;

  constructor(readonly requestManager: IRequestManager) {
    this.request = new EthRequestPayloads(undefined, 'latest');
  }

  static fromProvider(provider: Provider) {
    return new Eth(new RequestManager(provider));
  }

  async getId(): Promise<number> {
    const payload = this.request.getId();
    return payload.format(await this.requestManager.send(payload))!;
  }

  async getNodeInfo(): Promise<string> {
    const payload = this.request.getNodeInfo();
    return payload.format(await this.requestManager.send(payload))!;
  }

  async getProtocolVersion(): Promise<string> {
    const payload = this.request.getProtocolVersion();
    return payload.format(await this.requestManager.send(payload))!;
  }

  async getCoinbase(): Promise<Address> {
    const payload = this.request.getCoinbase();
    return payload.format(await this.requestManager.send(payload))!;
  }

  async isMining(): Promise<boolean> {
    const payload = this.request.isMining();
    return payload.format(await this.requestManager.send(payload))!;
  }

  async getHashrate(): Promise<number> {
    const payload = this.request.getHashrate();
    return payload.format(await this.requestManager.send(payload))!;
  }

  async isSyncing(): Promise<Sync | boolean> {
    const payload = this.request.isSyncing();
    return payload.format(await this.requestManager.send(payload))!;
  }

  async getGasPrice(): Promise<Quantity> {
    const payload = this.request.getGasPrice();
    return payload.format(await this.requestManager.send(payload))!;
  }

  async getAccounts(): Promise<Address[]> {
    const payload = this.request.getAccounts();
    return payload.format(await this.requestManager.send(payload))!;
  }

  async getBlockNumber(): Promise<number> {
    const payload = this.request.getBlockNumber();
    return payload.format(await this.requestManager.send(payload))!;
  }

  async getBalance(address: Address, block?: BlockType): Promise<Quantity> {
    const payload = this.request.getBalance(address, block);
    return payload.format(await this.requestManager.send(payload))!;
  }

  async getStorageAt(address: Address, position: string, block?: BlockType): Promise<Data> {
    const payload = this.request.getStorageAt(address, position, block);
    return payload.format(await this.requestManager.send(payload))!;
  }

  async getCode(address: Address, block?: BlockType): Promise<Data> {
    const payload = this.request.getCode(address, block);
    return payload.format(await this.requestManager.send(payload))!;
  }

  async getBlock(block: BlockType | BlockHash, returnTransactionObjects: boolean = false): Promise<Block> {
    const payload = this.request.getBlock(block, returnTransactionObjects);
    return payload.format(await this.requestManager.send(payload))!;
  }

  async getUncle(
    block: BlockType | BlockHash,
    uncleIndex: number,
    returnTransactionObjects: boolean = false,
  ): Promise<Block> {
    const payload = this.request.getUncle(block, uncleIndex, returnTransactionObjects);
    return payload.format(await this.requestManager.send(payload))!;
  }

  async getBlockTransactionCount(block: BlockType | BlockHash): Promise<number> {
    const payload = this.request.getBlockTransactionCount(block);
    return payload.format(await this.requestManager.send(payload))!;
  }

  async getBlockUncleCount(block: BlockType | BlockHash): Promise<number> {
    const payload = this.request.getBlockUncleCount(block);
    return payload.format(await this.requestManager.send(payload))!;
  }

  async getTransaction(hash: TransactionHash): Promise<Transaction> {
    const payload = this.request.getTransaction(hash);
    return payload.format(await this.requestManager.send(payload))!;
  }

  async getTransactionFromBlock(block: BlockType | BlockHash, index: number): Promise<Transaction> {
    const payload = this.request.getTransactionFromBlock(block, index);
    return payload.format(await this.requestManager.send(payload))!;
  }

  async getTransactionReceipt(hash: TransactionHash): Promise<TransactionReceipt> {
    const payload = this.request.getTransactionReceipt(hash);
    return payload.format(await this.requestManager.send(payload))!;
  }

  async getTransactionCount(address: Address, block?: BlockType): Promise<number> {
    const payload = this.request.getTransactionCount(address, block);
    return payload.format(await this.requestManager.send(payload))!;
  }

  async signTransaction(tx: Tx): Promise<SignedTransaction> {
    const payload = this.request.signTransaction(tx);
    return payload.format(await this.requestManager.send(payload))!;
  }

  sendSignedTransaction(
    data: Data,
    extraFormatters?: any,
    defer?: PromiEventResult<TransactionReceipt>,
  ): SendTxPromiEvent {
    defer = defer || promiEvent<TransactionReceipt>();
    const payload = this.request.sendSignedTransaction(data);
    this.sendTransactionAndWaitForConfirmation(defer, payload, extraFormatters);
    return defer.eventEmitter;
  }

  sendTransaction(tx: Tx, extraFormatters?: any): SendTxPromiEvent {
    // TODO: Can we remove extraFormatters, which is basically exposing contract internals here, and instead
    // wrap the returned PromiEvent in another PromiEvent that does the translations upstream?
    const defer = promiEvent<TransactionReceipt>();
    this.sendTransactionAsync(defer, tx, extraFormatters).catch(err => {
      fireError(err, defer.eventEmitter, defer.reject);
    });
    return defer.eventEmitter;
  }

  private getAccount(address?: string) {
    address = address || this.request.getDefaultAccount();
    if (this.wallet && address) {
      return this.wallet.get(address);
    }
  }

  private async sendTransactionAsync(defer, tx: Tx, extraFormatters) {
    const account = this.getAccount(tx.from);

    if (!tx.gasPrice) {
      tx.gasPrice = await this.getGasPrice();
    }

    let payload;
    if (!account) {
      payload = this.request.sendTransaction(tx);
    } else {
      const { from, ...fromlessTx } = tx;
      const signedTx = await account.signTransaction(fromlessTx);
      payload = this.request.sendSignedTransaction(signedTx.rawTransaction);
    }

    this.sendTransactionAndWaitForConfirmation(defer, payload, extraFormatters);
  }

  private async sendTransactionAndWaitForConfirmation(defer, payload, extraFormatters?) {
    try {
      const result = await this.requestManager.send(payload);
      defer.eventEmitter.emit('transactionHash', result);
      confirmTransaction(defer, result, payload, this, extraFormatters);
    } catch (err) {
      fireError(err, defer.eventEmitter, defer.reject);
    }
  }

  async sign(address: Address, dataToSign: Data): Promise<Data> {
    const account = this.getAccount(address);

    if (!account) {
      const payload = this.request.sign(address, dataToSign);
      return this.requestManager.send(payload);
    } else {
      const sig = account.sign(dataToSign);
      return sig.signature;
    }
  }

  async call(tx: Tx, block?: BlockType, outputFormatter = result => result): Promise<Data> {
    const payload = this.request.call(tx, block, outputFormatter);
    return payload.format(await this.requestManager.send(payload))!;
  }

  async estimateGas(tx: Tx): Promise<number> {
    const payload = this.request.estimateGas(tx);
    return payload.format(await this.requestManager.send(payload))!;
  }

  async submitWork(nonce: string, powHash: string, digest: string): Promise<boolean> {
    const payload = this.request.submitWork(nonce, powHash, digest);
    return payload.format(await this.requestManager.send(payload))!;
  }

  async getWork(): Promise<string[]> {
    const payload = this.request.getWork();
    return payload.format(await this.requestManager.send(payload))!;
  }

  async getPastLogs(options: {
    fromBlock?: BlockType;
    toBlock?: BlockType;
    address?: string;
    topics?: Array<string | string[]>;
  }): Promise<Log[]> {
    const payload = this.request.getPastLogs(options);
    return payload.format(await this.requestManager.send(payload))!;
  }

  subscribeLogs(options?: LogsSubscriptionOptions, callback?: Callback<Log>): Subscription<Log> {
    const subscription = new Subscription<Log>({
      subscription: {
        params: 1,
        inputFormatter: [inputLogFormatter],
        outputFormatter: outputLogFormatter,
        // DUBLICATE, also in web3-eth-contract
        subscriptionHandler: function(output) {
          if (output.removed) {
            this.emit('changed', output);
          } else {
            this.emit('data', output);
          }

          if (isFunction(this.callback)) {
            this.callback(null, output, this);
          }
        },
      },
      requestManager: this.requestManager,
      type: 'eth',
    });

    return subscription.subscribe('logs', options, callback);
  }

  subscribeSyncing(callback?: Callback<object | boolean>): Subscription<object | boolean> {
    const subscription = new Subscription<object | boolean>({
      subscription: {
        params: 0,
        outputFormatter: outputSyncingFormatter,
        subscriptionHandler: function(output) {
          var _this = this;

          // fire TRUE at start
          if (this._isSyncing !== true) {
            this._isSyncing = true;
            this.emit('changed', _this._isSyncing);

            if (isFunction(this.callback)) {
              this.callback(null, _this._isSyncing, this);
            }

            setTimeout(function() {
              _this.emit('data', output);

              if (isFunction(_this.callback)) {
                _this.callback(null, output, _this);
              }
            }, 0);

            // fire sync status
          } else {
            this.emit('data', output);
            if (isFunction(_this.callback)) {
              this.callback(null, output, this);
            }

            // wait for some time before fireing the FALSE
            clearTimeout(this._isSyncingTimeout);
            this._isSyncingTimeout = setTimeout(function() {
              if (output.currentBlock > output.highestBlock - 200) {
                _this._isSyncing = false;
                _this.emit('changed', _this._isSyncing);

                if (isFunction(_this.callback)) {
                  _this.callback(null, _this._isSyncing, _this);
                }
              }
            }, 500);
          }
        },
      },
      requestManager: this.requestManager,
      type: 'eth',
    });

    return subscription.subscribe('syncing', callback);
  }

  subscribeNewBlockHeaders(callback?: Callback<BlockHeader>): Subscription<BlockHeader> {
    const subscription = new Subscription<BlockHeader>({
      subscription: {
        subscriptionName: 'newHeads',
        params: 0,
        outputFormatter: outputBlockFormatter,
      },
      requestManager: this.requestManager,
      type: 'eth',
    });

    return subscription.subscribe('newBlockHeaders', callback);
  }

  subscribePendingTransactions(callback?: Callback<Transaction>): Subscription<Transaction> {
    const subscription = new Subscription<Transaction>({
      subscription: {
        subscriptionName: 'newPendingTransactions',
        params: 0,
      },
      requestManager: this.requestManager,
      type: 'eth',
    });

    return subscription.subscribe('pendingTransactions', callback);
  }

  // Deprecated
  subscribe(type: 'logs', options?: LogsSubscriptionOptions, callback?: Callback<Log>): Subscription<Log>;
  subscribe(type: 'syncing', callback?: Callback<object | boolean>): Subscription<object | boolean>;
  subscribe(type: 'newBlockHeaders', callback?: Callback<BlockHeader>): Subscription<BlockHeader>;
  subscribe(type: 'pendingTransactions', callback?: Callback<Transaction>): Subscription<Transaction>;
  subscribe(type: 'pendingTransactions' | 'newBlockHeaders' | 'syncing' | 'logs', ...args: any[]): Subscription<any> {
    switch (type) {
      case 'logs':
        return this.subscribeLogs(...args);
      case 'syncing':
        return this.subscribeSyncing(...args);
      case 'newBlockHeaders':
        return this.subscribeNewBlockHeaders(...args);
      case 'pendingTransactions':
        return this.subscribePendingTransactions(...args);
      default:
        throw new Error(`Unknown subscription type: ${type}`);
    }
  }

  clearSubscriptions() {
    this.requestManager.clearSubscriptions(false);
  }
}
