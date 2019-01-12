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

import { isBoolean } from 'util';
import { Address } from '../address';
import {
  GetLogOptions,
  inputLogFormatter,
  Log,
  outputBlockFormatter,
  outputLogFormatter,
  outputSyncingFormatter,
  Sync,
  Transaction,
  TransactionReceipt,
} from '../formatters';
import { PromiEvent, promiEvent, PromiEventResult } from '../promievent';
import { LegacyProvider, LegacyProviderAdapter } from '../providers';
import { EthereumProvider } from '../providers/ethereum-provider';
import { Subscription } from '../subscriptions';
import { TransactionHash } from '../types';
import { Data, Quantity } from '../types';
import { fireError } from '../utils';
import { Wallet } from '../wallet';
import { Block, BlockHash, BlockHeader, BlockType } from './block';
import { confirmTransaction } from './confirm-transaction';
import { EthRequestPayloads } from './eth-request-payloads';
import { SignedTransaction, Tx } from './tx';

declare const web3: { currentProvider?: LegacyProvider; ethereumProvider?: LegacyProvider } | undefined;

export type TypedSigningData = { type: string; name: string; value: string }[];

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
  public readonly request: EthRequestPayloads;
  private wallet?: Wallet;

  constructor(readonly provider: EthereumProvider) {
    this.request = new EthRequestPayloads(undefined, 'latest');
  }

  public static fromCurrentProvider() {
    if (!web3) {
      return;
    }
    const provider = web3.currentProvider || web3.ethereumProvider;
    if (!provider) {
      return;
    }
    return new Eth(new LegacyProviderAdapter(provider));
  }

  public setWallet(wallet?: Wallet) {
    this.wallet = wallet;
  }

  public getDefaultFromAddress() {
    return this.request.getDefaultFromAddress();
  }

  public setDefaultFromAddress(address?: Address) {
    this.request.setDefaultFromAddress(address);
  }

  private async send({ method, params, format }: { method: string; params?: any[]; format: any }) {
    return format(await this.provider.send(method, params));
  }

  public async getId(): Promise<number> {
    return await this.send(this.request.getId());
  }

  public async getNodeInfo(): Promise<string> {
    return await this.send(this.request.getNodeInfo());
  }

  public async getProtocolVersion(): Promise<string> {
    return await this.send(this.request.getProtocolVersion());
  }

  public async getCoinbase(): Promise<Address> {
    return await this.send(this.request.getCoinbase());
  }

  public async isMining(): Promise<boolean> {
    return await this.send(this.request.isMining());
  }

  public async getHashrate(): Promise<number> {
    return await this.send(this.request.getHashrate());
  }

  public async isSyncing(): Promise<Sync | boolean> {
    return await this.send(this.request.isSyncing());
  }

  public async getGasPrice(): Promise<Quantity> {
    return await this.send(this.request.getGasPrice());
  }

  public async getAccounts(): Promise<Address[]> {
    return await this.send(this.request.getAccounts());
  }

  public async getBlockNumber(): Promise<number> {
    return await this.send(this.request.getBlockNumber());
  }

  public async getBalance(address: Address, block?: BlockType): Promise<Quantity> {
    return await this.send(this.request.getBalance(address, block));
  }

  public async getStorageAt(address: Address, position: string, block?: BlockType): Promise<Data> {
    return await this.send(this.request.getStorageAt(address, position, block));
  }

  public async getCode(address: Address, block?: BlockType): Promise<Data> {
    return await this.send(this.request.getCode(address, block));
  }

  public async getBlock(block: BlockType | BlockHash, returnTransactionObjects: boolean = false): Promise<Block> {
    return await this.send(this.request.getBlock(block, returnTransactionObjects));
  }

  public async getUncle(
    block: BlockType | BlockHash,
    uncleIndex: number,
    returnTransactionObjects: boolean = false,
  ): Promise<Block> {
    return await this.send(this.request.getUncle(block, uncleIndex, returnTransactionObjects));
  }

  public async getBlockTransactionCount(block: BlockType | BlockHash): Promise<number> {
    return await this.send(this.request.getBlockTransactionCount(block));
  }

  public async getBlockUncleCount(block: BlockType | BlockHash): Promise<number> {
    return await this.send(this.request.getBlockUncleCount(block));
  }

  public async getTransaction(hash: TransactionHash): Promise<Transaction> {
    return await this.send(this.request.getTransaction(hash));
  }

  public async getTransactionFromBlock(block: BlockType | BlockHash, index: number): Promise<Transaction> {
    return await this.send(this.request.getTransactionFromBlock(block, index));
  }

  public async getTransactionReceipt(hash: TransactionHash): Promise<TransactionReceipt> {
    return await this.send(this.request.getTransactionReceipt(hash));
  }

  public async getTransactionCount(address: Address, block?: BlockType): Promise<number> {
    return await this.send(this.request.getTransactionCount(address, block));
  }

  public async signTransaction(tx: Tx): Promise<SignedTransaction> {
    return await this.send(this.request.signTransaction(tx));
  }

  public sendSignedTransaction(
    data: Data,
    extraFormatters?: any,
    defer?: PromiEventResult<TransactionReceipt>,
  ): SendTxPromiEvent {
    defer = defer || promiEvent<TransactionReceipt>();
    const payload = this.request.sendSignedTransaction(data);
    this.sendTransactionAndWaitForConfirmation(defer, payload, extraFormatters);
    return defer.eventEmitter;
  }

  public sendTransaction(tx: Tx, extraFormatters?: any): SendTxPromiEvent {
    // TODO: Can we remove extraFormatters, which is basically exposing contract internals here, and instead
    // wrap the returned PromiEvent in another PromiEvent that does the translations upstream?
    const defer = promiEvent<TransactionReceipt>();
    this.sendTransactionAsync(defer, tx, extraFormatters).catch(err => {
      fireError(err, defer.eventEmitter, defer.reject);
    });
    return defer.eventEmitter;
  }

  private getAccount(address?: Address) {
    address = address || this.request.getDefaultFromAddress();
    if (this.wallet && address) {
      return this.wallet.get(address.toString());
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
      const result = await this.send(payload);
      defer.eventEmitter.emit('transactionHash', result);
      confirmTransaction(defer, result, payload, this, extraFormatters);
    } catch (err) {
      fireError(err, defer.eventEmitter, defer.reject);
    }
  }

  public async sign(address: Address, dataToSign: Data): Promise<Data> {
    const account = this.getAccount(address);

    if (!account) {
      return await this.send(this.request.sign(address, dataToSign));
    } else {
      const sig = account.sign(dataToSign);
      return sig.signature;
    }
  }

  public async signTypedData(address: Address, dataToSign: TypedSigningData): Promise<Data> {
    return await this.send(this.request.signTypedData(address, dataToSign));
  }

  public async call(tx: Tx, block?: BlockType, outputFormatter = result => result): Promise<Data> {
    return await this.send(this.request.call(tx, block, outputFormatter));
  }

  public async estimateGas(tx: Tx): Promise<number> {
    return await this.send(this.request.estimateGas(tx));
  }

  public async submitWork(nonce: string, powHash: string, digest: string): Promise<boolean> {
    return await this.send(this.request.submitWork(nonce, powHash, digest));
  }

  public async getWork(): Promise<string[]> {
    return await this.send(this.request.getWork());
  }

  public async getPastLogs(options: GetLogOptions): Promise<Log[]> {
    return await this.send(this.request.getPastLogs(options));
  }

  public subscribeLogs(options: GetLogOptions = {}): Subscription<Log> {
    const { fromBlock, ...subLogOptions } = options;
    const subscription = new Subscription<Log>('eth', 'logs', [inputLogFormatter(subLogOptions)], this.provider);

    subscription.on('rawdata', result => {
      const output = outputLogFormatter(result);
      if (output.removed) {
        subscription.emit('changed', output);
      } else {
        subscription.emit('data', output);
      }
    });

    if (fromBlock !== undefined) {
      this.getPastLogs(options)
        .then(logs => {
          logs.forEach(log => subscription.emit('rawdata', log));
          subscription.subscribe();
        })
        .catch(err => {
          subscription.emit('error', err);
        });
    } else {
      process.nextTick(() => subscription.subscribe());
    }

    return subscription;
  }

  public subscribeSyncing(): Subscription<object | boolean> {
    const subscription = new Subscription<object | boolean>('eth', 'syncing', [], this.provider);

    subscription.on('rawdata', result => {
      const output = outputSyncingFormatter(result);
      if (isBoolean(output)) {
        subscription.emit('changed', output);
        return;
      }
      subscription.emit('data', output);
    });

    process.nextTick(() => subscription.subscribe());

    return subscription;
  }

  public subscribeNewBlockHeaders(): Subscription<BlockHeader> {
    const subscription = new Subscription<BlockHeader>('eth', 'newHeads', [], this.provider);

    subscription.on('rawdata', result => {
      const output = outputBlockFormatter(result);
      subscription.emit('data', output);
    });

    process.nextTick(() => subscription.subscribe());

    return subscription;
  }

  public subscribePendingTransactions(): Subscription<Transaction> {
    const subscription = new Subscription<Transaction>('eth', 'newPendingTransactions', [], this.provider);
    subscription.on('rawdata', result => subscription.emit('data', result));
    process.nextTick(() => subscription.subscribe());
    return subscription;
  }

  public subscribe(type: 'logs', options?: GetLogOptions): Subscription<Log>;
  public subscribe(type: 'syncing'): Subscription<object | boolean>;
  public subscribe(type: 'newBlockHeaders'): Subscription<BlockHeader>;
  public subscribe(type: 'pendingTransactions'): Subscription<Transaction>;
  public subscribe(type: 'pendingTransactions' | 'newBlockHeaders' | 'syncing' | 'logs', ...args: any[]): Subscription<any> {
    switch (type) {
      case 'logs':
        return this.subscribeLogs(...args);
      case 'syncing':
        return this.subscribeSyncing();
      case 'newBlockHeaders':
        return this.subscribeNewBlockHeaders();
      case 'pendingTransactions':
        return this.subscribePendingTransactions();
      default:
        throw new Error(`Unknown subscription type: ${type}`);
    }
  }
}
