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
import {
  BlockHeaderResponse,
  BlockResponse,
  CallRequest,
  EstimateRequest,
  LogRequest,
  LogResponse,
  PartialTransactionRequest,
  TransactionRequest,
  TransactionResponse,
} from '../formatters';
import { LegacyProvider, LegacyProviderAdapter } from '../providers';
import { EthereumProvider } from '../providers/ethereum-provider';
import { Subscription } from '../subscriptions';
import { TransactionHash } from '../types';
import { Wallet } from '../wallet';
import { BlockHash, BlockType } from './block';
import { EthRequestPayloads } from './eth-request-payloads';
import { SendTx, SentTransaction } from './send-tx';
import { subscribeForLogs } from './subscriptions/logs';
import { subscribeForNewHeads } from './subscriptions/new-heads';
import { subscribeForNewPendingTransactions } from './subscriptions/new-pending-transactions';
import { subscribeForSyncing } from './subscriptions/syncing';

declare const web3: { currentProvider?: LegacyProvider; ethereumProvider?: LegacyProvider } | undefined;

export type TypedSigningData = { type: string; name: string; value: string }[];

export class Eth {
  public readonly request: EthRequestPayloads;
  public wallet?: Wallet;

  constructor(readonly provider: EthereumProvider) {
    this.request = new EthRequestPayloads(undefined, 'latest');
  }

  public static fromCurrentProvider() {
    if (typeof web3 === 'undefined') {
      return;
    }
    const provider = web3.currentProvider || web3.ethereumProvider;
    if (!provider) {
      return;
    }
    return new Eth(new LegacyProviderAdapter(provider));
  }

  public get defaultFromAddress(): Address | undefined {
    return this.request.defaultFromAddress;
  }

  public set defaultFromAddress(address: Address | undefined) {
    this.request.defaultFromAddress = address;
  }

  private async send<T>({ method, params, format }: { method: string; params?: any[]; format: (x: any) => T }) {
    return format(await this.provider.send(method, params));
  }

  public async getId() {
    return await this.send(this.request.getId());
  }

  public async getNodeInfo() {
    return await this.send(this.request.getNodeInfo());
  }

  public async getProtocolVersion() {
    return await this.send(this.request.getProtocolVersion());
  }

  public async getCoinbase() {
    return await this.send(this.request.getCoinbase());
  }

  public async isMining() {
    return await this.send(this.request.isMining());
  }

  public async getHashrate() {
    return await this.send(this.request.getHashrate());
  }

  public async isSyncing() {
    return await this.send(this.request.isSyncing());
  }

  public async getGasPrice() {
    return await this.send(this.request.getGasPrice());
  }

  public async getAccounts() {
    return await this.send(this.request.getAccounts());
  }

  public async getBlockNumber() {
    return await this.send(this.request.getBlockNumber());
  }

  public async getBalance(address: Address, block?: BlockType) {
    return await this.send(this.request.getBalance(address, block));
  }

  public async getStorageAt(address: Address, position: string, block?: BlockType) {
    return await this.send(this.request.getStorageAt(address, position, block));
  }

  public async getCode(address: Address, block?: BlockType) {
    return await this.send(this.request.getCode(address, block));
  }

  public async getBlock(block: BlockType | BlockHash, returnTxs?: false): Promise<BlockResponse<Buffer>>;
  public async getBlock(block: BlockType | BlockHash, returnTxs?: true): Promise<BlockResponse<TransactionResponse>>;
  public async getBlock(block: BlockType | BlockHash, returnTxs?: boolean): Promise<BlockResponse> {
    return await this.send(this.request.getBlock(block, returnTxs));
  }

  public async getUncle(
    block: BlockType | BlockHash,
    uncleIndex: number,
    returnTxs?: false,
  ): Promise<BlockResponse<Buffer>>;
  public async getUncle(
    block: BlockType | BlockHash,
    uncleIndex: number,
    returnTxs?: true,
  ): Promise<BlockResponse<TransactionResponse>>;
  public async getUncle(block: BlockType | BlockHash, uncleIndex: number, returnTxs?: boolean) {
    return await this.send(this.request.getUncle(block, uncleIndex, returnTxs));
  }

  public async getBlockTransactionCount(block: BlockType | BlockHash) {
    return await this.send(this.request.getBlockTransactionCount(block));
  }

  public async getBlockUncleCount(block: BlockType | BlockHash) {
    return await this.send(this.request.getBlockUncleCount(block));
  }

  public async getTransaction(hash: TransactionHash) {
    return await this.send(this.request.getTransaction(hash));
  }

  public async getTransactionFromBlock(block: BlockType | BlockHash, index: number) {
    return await this.send(this.request.getTransactionFromBlock(block, index));
  }

  public async getTransactionReceipt(txHash: TransactionHash) {
    return await this.send(this.request.getTransactionReceipt(txHash));
  }

  public async getTransactionCount(address: Address, block?: BlockType) {
    return await this.send(this.request.getTransactionCount(address, block));
  }

  public async signTransaction(tx: TransactionRequest) {
    return await this.send(this.request.signTransaction(tx));
  }

  public sendSignedTransaction(data: string): SendTx {
    const { method, params } = this.request.sendSignedTransaction(data);
    const txHashPromise = this.provider.send(method, params);
    return new SentTransaction(this, txHashPromise);
  }

  public sendTransaction(tx: PartialTransactionRequest): SendTx {
    const promise = new Promise<TransactionHash>(async (resolve, reject) => {
      try {
        if (!tx.gasPrice) {
          tx.gasPrice = await this.getGasPrice();
        }

        const account = this.getAccount(tx.from);

        if (!account) {
          const { method, params, format } = this.request.sendTransaction(tx);
          const txHash = format(await this.provider.send(method, params));
          resolve(txHash);
        } else {
          const { from, ...fromlessTx } = tx;
          const signedTx = await account.signTransaction(fromlessTx, this);
          const { method, params, format } = this.request.sendSignedTransaction(signedTx.rawTransaction);
          const txHash = format(await this.provider.send(method, params));
          resolve(txHash);
        }
      } catch (err) {
        reject(err);
      }
    });

    return new SentTransaction(this, promise);
  }

  private getAccount(address?: Address) {
    address = address || this.defaultFromAddress;
    if (this.wallet && address) {
      return this.wallet.get(address);
    }
  }

  public async sign(address: Address, dataToSign: string) {
    const account = this.getAccount(address);

    if (!account) {
      return await this.send(this.request.sign(address, dataToSign));
    } else {
      const sig = account.sign(dataToSign);
      return sig.signature;
    }
  }

  public async signTypedData(address: Address, dataToSign: TypedSigningData) {
    return await this.send(this.request.signTypedData(address, dataToSign));
  }

  public async call(tx: CallRequest, block?: BlockType) {
    return await this.send(this.request.call(tx, block));
  }

  public async estimateGas(tx: EstimateRequest) {
    return await this.send(this.request.estimateGas(tx));
  }

  public async submitWork(nonce: string, powHash: string, digest: string) {
    return await this.send(this.request.submitWork(nonce, powHash, digest));
  }

  public async getWork() {
    return await this.send(this.request.getWork());
  }

  public async getPastLogs(options: LogRequest) {
    return await this.send(this.request.getPastLogs(options));
  }

  public subscribe(type: 'logs', options?: LogRequest): Subscription<LogResponse>;
  public subscribe(type: 'syncing'): Subscription<object | boolean>;
  public subscribe(type: 'newBlockHeaders'): Subscription<BlockHeaderResponse>;
  public subscribe(type: 'pendingTransactions'): Subscription<TransactionResponse>;
  public subscribe(
    type: 'pendingTransactions' | 'newBlockHeaders' | 'syncing' | 'logs',
    ...args: any[]
  ): Subscription<any> {
    switch (type) {
      case 'logs':
        return subscribeForLogs(this, ...args);
      case 'syncing':
        return subscribeForSyncing(this.provider);
      case 'newBlockHeaders':
        return subscribeForNewHeads(this.provider);
      case 'pendingTransactions':
        return subscribeForNewPendingTransactions(this.provider);
      default:
        throw new Error(`Unknown subscription type: ${type}`);
    }
  }
}
