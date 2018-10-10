/*
 This file is part of web3.js.

 web3.js is free software: you can redistribute it and/or modify
 it under the terms of the GNU Lesser General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 web3.js is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public License
 along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * @file index.js
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */

import { Subscription } from '../core-subscriptions';
import { Method } from '../core-method';
import { Net } from '../net';
import { Personal } from './personal';
import { Contract, ContractAbi, ContractOptions } from './contract';
import { Accounts } from './accounts';
import { IRequestManager, BatchManager } from '../core-request-manager';
import { toChecksumAddress, numberToHex, hexToNumber } from '../utils';
import {
  inputAddressFormatter,
  outputSyncingFormatter,
  outputBigNumberFormatter,
  inputDefaultBlockNumberFormatter,
  inputBlockNumberFormatter,
  outputBlockFormatter,
  outputTransactionFormatter,
  outputTransactionReceiptFormatter,
  inputTransactionFormatter,
  inputSignFormatter,
  inputCallFormatter,
  inputLogFormatter,
  outputLogFormatter,
} from '../core-helpers/formatters';
import { isString, isFunction } from 'util';
import { BlockHeader, Transaction, LogsSubscriptionOptions, Tx, BlockType, Block, BlockHash, TxHash } from './types';
import { Callback, Log, Data, Address, Quantity, TransactionReceipt, EncodedTransaction } from '../types';
import { PromiEvent } from '../core-promievent';

export class Eth {
  public accounts: Accounts;
  public personal: Personal;
  public Contract: new (abi: ContractAbi, address?: string, options?: ContractOptions) => Contract;
  public net: Net;
  public BatchRequest: new () => BatchManager;

  constructor(
    readonly requestManager: IRequestManager,
    readonly defaultAccount?,
    readonly defaultBlock: BlockType = 'latest',
  ) {
    if (this.defaultAccount) {
      this.defaultAccount = toChecksumAddress(inputAddressFormatter(this.defaultAccount));
    }
    const accounts = new Accounts(this);
    this.accounts = accounts;
    this.net = new Net(this);
    this.personal = new Personal(this.requestManager, this.defaultAccount, this.defaultBlock);

    this.Contract = class extends Contract {
      constructor(abi: ContractAbi, address?: string, options?: ContractOptions) {
        super(requestManager, abi, address, accounts, options);
      }
    };

    this.BatchRequest = class extends BatchManager {
      constructor() {
        super(requestManager);
      }
    };
  }

  getId(): Promise<string> {
    const method = new Method({
      name: 'getId',
      call: 'net_version',
      params: 0,
      outputFormatter: hexToNumber,
      requestManager: this.requestManager,
    }).createFunction();

    return method();
  }

  getNodeInfo(): Promise<string> {
    const method = new Method({
      name: 'getNodeInfo',
      call: 'web3_clientVersion',
      requestManager: this.requestManager,
    }).createFunction();

    return method();
  }

  getProtocolVersion(): Promise<string> {
    const method = new Method({
      name: 'getProtocolVersion',
      call: 'eth_protocolVersion',
      params: 0,
      requestManager: this.requestManager,
    }).createFunction();

    return method();
  }

  getCoinbase(): Promise<Address> {
    const method = new Method({
      name: 'getCoinbase',
      call: 'eth_coinbase',
      params: 0,
      requestManager: this.requestManager,
    }).createFunction();

    return method();
  }

  isMining(): Promise<boolean> {
    const method = new Method({
      name: 'isMining',
      call: 'eth_mining',
      params: 0,
      requestManager: this.requestManager,
    }).createFunction();

    return method();
  }

  getHashrate(): Promise<number> {
    const method = new Method({
      name: 'getHashrate',
      call: 'eth_hashrate',
      params: 0,
      outputFormatter: hexToNumber,
      requestManager: this.requestManager,
    }).createFunction();

    return method();
  }

  isSyncing(): Promise<boolean> {
    const method = new Method({
      name: 'isSyncing',
      call: 'eth_syncing',
      params: 0,
      outputFormatter: outputSyncingFormatter,
      requestManager: this.requestManager,
    }).createFunction();

    return method();
  }

  getGasPrice(): Promise<Quantity> {
    const method = new Method({
      name: 'getGasPrice',
      call: 'eth_gasPrice',
      params: 0,
      outputFormatter: outputBigNumberFormatter,
      requestManager: this.requestManager,
    }).createFunction();

    return method();
  }

  getAccounts(): Promise<Address[]> {
    const method = new Method({
      name: 'getAccounts',
      call: 'eth_accounts',
      params: 0,
      outputFormatter: toChecksumAddress,
      requestManager: this.requestManager,
    }).createFunction();

    return method();
  }

  getBlockNumber(): Promise<number> {
    const method = new Method({
      name: 'getBlockNumber',
      call: 'eth_blockNumber',
      params: 0,
      outputFormatter: hexToNumber,
      requestManager: this.requestManager,
    }).createFunction();

    return method();
  }

  getBalance(address: Address, defaultBlock?: BlockType): Promise<Quantity> {
    const method = new Method({
      name: 'getBalance',
      call: 'eth_getBalance',
      params: 2,
      inputFormatter: [inputAddressFormatter, inputDefaultBlockNumberFormatter],
      outputFormatter: outputBigNumberFormatter,
      defaultBlock,
      requestManager: this.requestManager,
    }).createFunction();

    return method(address);
  }

  getStorageAt(address: Address, defaultBlock?: BlockType): Promise<Data> {
    const method = new Method({
      name: 'getStorageAt',
      call: 'eth_getStorageAt',
      params: 3,
      inputFormatter: [inputAddressFormatter, numberToHex, inputDefaultBlockNumberFormatter],
      defaultBlock,
      requestManager: this.requestManager,
    }).createFunction();

    return method(address);
  }

  getCode(address: Address, defaultBlock?: BlockType): Promise<Data> {
    const method = new Method({
      name: 'getCode',
      call: 'eth_getCode',
      params: 2,
      inputFormatter: [inputAddressFormatter, inputDefaultBlockNumberFormatter],
      defaultBlock,
      requestManager: this.requestManager,
    }).createFunction();

    return method(address);
  }

  getBlock(blockRef: BlockType | BlockHash, returnTransactionObjects?: boolean): Promise<Block> {
    const blockCall =
      isString(blockRef[0]) && blockRef[0].indexOf('0x') === 0 ? 'eth_getBlockByHash' : 'eth_getBlockByNumber';

    const method = new Method({
      name: 'getBlock',
      call: blockCall,
      params: 2,
      inputFormatter: [
        inputBlockNumberFormatter,
        function(val) {
          return !!val;
        },
      ],
      outputFormatter: outputBlockFormatter,
      requestManager: this.requestManager,
    }).createFunction();

    return method(blockRef, returnTransactionObjects);
  }

  getUncle(blockRef: BlockType | BlockHash, uncleIndex: number, returnTransactionObjects?: boolean): Promise<Block> {
    const uncleCall =
      isString(blockRef[0]) && blockRef[0].indexOf('0x') === 0
        ? 'eth_getUncleByBlockHashAndIndex'
        : 'eth_getUncleByBlockNumberAndIndex';

    const method = new Method({
      name: 'getUncle',
      call: uncleCall,
      params: 2,
      inputFormatter: [inputBlockNumberFormatter, numberToHex],
      outputFormatter: outputBlockFormatter,
      requestManager: this.requestManager,
    }).createFunction();

    return method(blockRef, uncleIndex, returnTransactionObjects);
  }

  getBlockTransactionCount(blockRef: BlockType | BlockHash): Promise<number> {
    const blockTransactionCountCall =
      isString(blockRef[0]) && blockRef[0].indexOf('0x') === 0
        ? 'eth_getBlockTransactionCountByHash'
        : 'eth_getBlockTransactionCountByNumber';

    const method = new Method({
      name: 'getBlockTransactionCount',
      call: blockTransactionCountCall,
      params: 1,
      inputFormatter: [inputBlockNumberFormatter],
      outputFormatter: hexToNumber,
      requestManager: this.requestManager,
    }).createFunction();

    return method(blockRef);
  }

  getBlockUncleCount(blockRef: BlockType | BlockHash): Promise<number> {
    const uncleCountCall =
      isString(blockRef[0]) && blockRef[0].indexOf('0x') === 0
        ? 'eth_getUncleCountByBlockHash'
        : 'eth_getUncleCountByBlockNumber';

    const method = new Method({
      name: 'getBlockUncleCount',
      call: uncleCountCall,
      params: 1,
      inputFormatter: [inputBlockNumberFormatter],
      outputFormatter: hexToNumber,
      requestManager: this.requestManager,
    }).createFunction();

    return method(blockRef);
  }

  getTransaction(hash: TxHash): Promise<Transaction> {
    const method = new Method({
      name: 'getTransaction',
      call: 'eth_getTransactionByHash',
      params: 1,
      inputFormatter: [null],
      outputFormatter: outputTransactionFormatter,
      requestManager: this.requestManager,
    }).createFunction();

    return method(hash);
  }

  getTransactionFromBlock(blockRef: BlockType | BlockHash, index: number): Promise<Transaction> {
    const transactionFromBlockCall =
      isString(blockRef[0]) && blockRef[0].indexOf('0x') === 0
        ? 'eth_getTransactionByBlockHashAndIndex'
        : 'eth_getTransactionByBlockNumberAndIndex';

    const method = new Method({
      name: 'getTransactionFromBlock',
      call: transactionFromBlockCall,
      params: 2,
      inputFormatter: [inputBlockNumberFormatter, numberToHex],
      outputFormatter: outputTransactionFormatter,
      requestManager: this.requestManager,
    }).createFunction();

    return method(blockRef, index);
  }

  getTransactionReceipt(hash: TxHash): Promise<TransactionReceipt> {
    const method = new Method({
      name: 'getTransactionReceipt',
      call: 'eth_getTransactionReceipt',
      params: 1,
      inputFormatter: [null],
      outputFormatter: outputTransactionReceiptFormatter,
      requestManager: this.requestManager,
    }).createFunction();

    return method(hash);
  }

  getTransactionCount(address: Address, defaultBlock?: BlockType): Promise<number> {
    const method = new Method({
      name: 'getTransactionCount',
      call: 'eth_getTransactionCount',
      params: 2,
      inputFormatter: [inputAddressFormatter, inputDefaultBlockNumberFormatter],
      outputFormatter: hexToNumber,
      defaultBlock,
      requestManager: this.requestManager,
    }).createFunction();

    return method(address);
  }

  sendSignedTransaction(data: Data): PromiEvent<TransactionReceipt> {
    const method = new Method({
      name: 'sendSignedTransaction',
      call: 'eth_sendRawTransaction',
      params: 1,
      inputFormatter: [null],
      requestManager: this.requestManager,
    }).createFunction();

    return method(data);
  }

  signTransaction(tx: Tx, address?: Address): Promise<EncodedTransaction> {
    const method = new Method({
      name: 'signTransaction',
      call: 'eth_signTransaction',
      params: 1,
      inputFormatter: [inputTransactionFormatter],
      requestManager: this.requestManager,
    }).createFunction();

    return method(tx, address);
  }

  sendTransaction(tx: Tx): PromiEvent<TransactionReceipt> {
    const method = new Method({
      name: 'sendTransaction',
      call: 'eth_sendTransaction',
      params: 1,
      inputFormatter: [inputTransactionFormatter],
      requestManager: this.requestManager,
    }).createFunction();

    return method(tx);
  }

  sign(address: Address, dataToSign: Data): Promise<Data> {
    const method = new Method({
      name: 'sign',
      call: 'eth_sign',
      params: 2,
      inputFormatter: [inputSignFormatter, inputAddressFormatter],
      transformPayload: function(payload) {
        payload.params.reverse();
        return payload;
      },
      requestManager: this.requestManager,
    }).createFunction();

    return method(address, dataToSign);
  }

  call(callObject: Tx, defaultBlock?: BlockType): Promise<Data> {
    const method = new Method({
      name: 'call',
      call: 'eth_call',
      params: 2,
      inputFormatter: [inputCallFormatter, inputDefaultBlockNumberFormatter],
      defaultBlock,
      requestManager: this.requestManager,
    }).createFunction();

    return method(callObject);
  }

  estimateGas(tx: Tx): Promise<number> {
    const method = new Method({
      name: 'estimateGas',
      call: 'eth_estimateGas',
      params: 1,
      inputFormatter: [inputCallFormatter],
      outputFormatter: hexToNumber,
      requestManager: this.requestManager,
    }).createFunction();

    return method(tx);
  }

  submitWork(nonce: string, powHash: string, digest: string): Promise<boolean> {
    const method = new Method({
      name: 'submitWork',
      call: 'eth_submitWork',
      params: 3,
      requestManager: this.requestManager,
    }).createFunction();

    return method(nonce, powHash, digest);
  }

  getWork(): Promise<string[]> {
    const method = new Method({
      name: 'getWork',
      call: 'eth_getWork',
      params: 0,
      requestManager: this.requestManager,
    }).createFunction();

    return method();
  }

  getPastLogs(options: {
    fromBlock?: BlockType;
    toBlock?: BlockType;
    address?: string;
    topics?: Array<string | string[]>;
  }): Promise<Log[]> {
    const method = new Method({
      name: 'getPastLogs',
      call: 'eth_getLogs',
      params: 1,
      inputFormatter: [inputLogFormatter],
      outputFormatter: outputLogFormatter,
      requestManager: this.requestManager,
    }).createFunction();

    return method(options);
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

    return subscription.subscribe('syncing', undefined, callback);
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

    return subscription.subscribe('newBlockHeaders', undefined, callback);
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

    return subscription.subscribe('pendingTransactions', undefined, callback);
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
    }
  }

  clearSubscriptions() {
    this.requestManager.clearSubscriptions(false);
  }
}
