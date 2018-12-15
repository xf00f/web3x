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
import { Wallet } from '../wallet';
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
import { TransactionHash } from '../types';
import { Callback, Data, Address, Quantity } from '../types';
import { PromiEvent, promiEvent, PromiEventResult } from '../promievent';
import { confirmTransaction } from './confirm-transaction';
import { EthRequestPayloads } from './eth-request-payloads';
import { Block, BlockHeader, BlockType, BlockHash } from './block';
import { Tx, SignedTransaction } from './tx';
import { EthereumProvider } from '../providers/ethereum';

export type TypedSigningData = { type: string; name: string; value: string }[];

export interface LogsSubscriptionOptions {
  fromBlock?: number;
  address?: string;
  topics?: Array<string | string[]>;
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
  private wallet?: Wallet;

  constructor(readonly provider: EthereumProvider) {
    this.request = new EthRequestPayloads(undefined, 'latest');
  }

  setWallet(wallet?: Wallet) {
    this.wallet = wallet;
  }

  getDefaultFromAddress() {
    return this.request.getDefaultFromAddress();
  }

  setDefaultFromAddress(address?: string) {
    this.request.setDefaultFromAddress(address);
  }

  private async send({ method, params, format }: { method: string; params?: any[]; format: any }) {
    return format(await this.provider.send(method, params));
  }

  async getId(): Promise<number> {
    return await this.send(this.request.getId());
  }

  async getNodeInfo(): Promise<string> {
    return await this.send(this.request.getNodeInfo());
  }

  async getProtocolVersion(): Promise<string> {
    return await this.send(this.request.getProtocolVersion());
  }

  async getCoinbase(): Promise<Address> {
    return await this.send(this.request.getCoinbase());
  }

  async isMining(): Promise<boolean> {
    return await this.send(this.request.isMining());
  }

  async getHashrate(): Promise<number> {
    return await this.send(this.request.getHashrate());
  }

  async isSyncing(): Promise<Sync | boolean> {
    return await this.send(this.request.isSyncing());
  }

  async getGasPrice(): Promise<Quantity> {
    return await this.send(this.request.getGasPrice());
  }

  async getAccounts(): Promise<Address[]> {
    return await this.send(this.request.getAccounts());
  }

  async getBlockNumber(): Promise<number> {
    return await this.send(this.request.getBlockNumber());
  }

  async getBalance(address: Address, block?: BlockType): Promise<Quantity> {
    return await this.send(this.request.getBalance(address, block));
  }

  async getStorageAt(address: Address, position: string, block?: BlockType): Promise<Data> {
    return await this.send(this.request.getStorageAt(address, position, block));
  }

  async getCode(address: Address, block?: BlockType): Promise<Data> {
    return await this.send(this.request.getCode(address, block));
  }

  async getBlock(block: BlockType | BlockHash, returnTransactionObjects: boolean = false): Promise<Block> {
    return await this.send(this.request.getBlock(block, returnTransactionObjects));
  }

  async getUncle(
    block: BlockType | BlockHash,
    uncleIndex: number,
    returnTransactionObjects: boolean = false,
  ): Promise<Block> {
    return await this.send(this.request.getUncle(block, uncleIndex, returnTransactionObjects));
  }

  async getBlockTransactionCount(block: BlockType | BlockHash): Promise<number> {
    return await this.send(this.request.getBlockTransactionCount(block));
  }

  async getBlockUncleCount(block: BlockType | BlockHash): Promise<number> {
    return await this.send(this.request.getBlockUncleCount(block));
  }

  async getTransaction(hash: TransactionHash): Promise<Transaction> {
    return await this.send(this.request.getTransaction(hash));
  }

  async getTransactionFromBlock(block: BlockType | BlockHash, index: number): Promise<Transaction> {
    return await this.send(this.request.getTransactionFromBlock(block, index));
  }

  async getTransactionReceipt(hash: TransactionHash): Promise<TransactionReceipt> {
    return await this.send(this.request.getTransactionReceipt(hash));
  }

  async getTransactionCount(address: Address, block?: BlockType): Promise<number> {
    return await this.send(this.request.getTransactionCount(address, block));
  }

  async signTransaction(tx: Tx): Promise<SignedTransaction> {
    return await this.send(this.request.signTransaction(tx));
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
    address = address || this.request.getDefaultFromAddress();
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
      const signedTx = await account.signTransaction(fromlessTx, this);
      payload = this.request.sendSignedTransaction(signedTx.rawTransaction);
    }

    this.sendTransactionAndWaitForConfirmation(defer, payload, extraFormatters);
  }

  private async sendTransactionAndWaitForConfirmation(defer, payload, extraFormatters?) {
    try {
      const result = await this.provider.send(payload);
      defer.eventEmitter.emit('transactionHash', result);
      confirmTransaction(defer, result, payload, this, extraFormatters);
    } catch (err) {
      fireError(err, defer.eventEmitter, defer.reject);
    }
  }

  async sign(address: Address, dataToSign: Data): Promise<Data> {
    const account = this.getAccount(address);

    if (!account) {
      return await this.send(this.request.sign(address, dataToSign));
    } else {
      const sig = account.sign(dataToSign);
      return sig.signature;
    }
  }

  async signTypedData(address: Address, dataToSign: TypedSigningData): Promise<Data> {
    return await this.send(this.request.signTypedData(address, dataToSign));
  }

  async call(tx: Tx, block?: BlockType, outputFormatter = result => result): Promise<Data> {
    return await this.send(this.request.call(tx, block, outputFormatter));
  }

  async estimateGas(tx: Tx): Promise<number> {
    return await this.send(this.request.estimateGas(tx));
  }

  async submitWork(nonce: string, powHash: string, digest: string): Promise<boolean> {
    return await this.send(this.request.submitWork(nonce, powHash, digest));
  }

  async getWork(): Promise<string[]> {
    return await this.send(this.request.getWork());
  }

  async getPastLogs(options: {
    fromBlock?: BlockType;
    toBlock?: BlockType;
    address?: string;
    topics?: Array<string | string[]>;
  }): Promise<Log[]> {
    return await this.send(this.request.getPastLogs(options));
  }

  subscribeLogs(options?: LogsSubscriptionOptions, callback?: Callback<Log>): Subscription<Log> {
    const subscription = new Subscription<Log>('logs', [inputLogFormatter(options)], this.provider);

    subscription.on('rawdata', result => {
      const output = outputLogFormatter(result);
      if (output.removed) {
        subscription.emit('changed', output);
      } else {
        subscription.emit('data', output);
      }
    });

    return subscription;
    /*
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
    */
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
