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

import { isString } from 'util';
import { Address } from '../address';
import {
  GetLogOptions,
  inputBlockNumberFormatter,
  inputCallFormatter,
  inputLogFormatter,
  inputSignFormatter,
  inputTransactionFormatter,
  outputBigNumberFormatter,
  outputBlockFormatter,
  outputLogFormatter,
  outputSyncingFormatter,
  outputTransactionFormatter,
  outputTransactionReceiptFormatter,
} from '../formatters';
import { TransactionHash } from '../types';
import { Data } from '../types';
import { hexToNumber, isHexStrict, numberToHex } from '../utils';
import { BlockHash, BlockType } from './block';
import { Tx } from './tx';

const identity = result => result;

export interface EthRequestPayload {
  method: string;
  params: any[];
  format: (result: any) => any;
}

export class EthRequestPayloads {
  constructor(public defaultFromAddress?: Address, private defaultBlock: BlockType = 'latest') {}

  public getDefaultBlock() {
    return this.defaultBlock;
  }

  public setDefaultBlock(block: BlockType) {
    this.defaultBlock = block;
  }

  public getId() {
    return {
      method: 'net_version',
      format: hexToNumber,
    };
  }

  public getNodeInfo() {
    return {
      method: 'web3_clientVersion',
      format: identity,
    };
  }

  public getProtocolVersion() {
    return {
      method: 'eth_protocolVersion',
      format: identity,
    };
  }

  public getCoinbase() {
    return {
      method: 'eth_coinbase',
      format: identity,
    };
  }

  public isMining() {
    return {
      method: 'eth_mining',
      format: identity,
    };
  }

  public getHashrate() {
    return {
      method: 'eth_hashrate',
      format: hexToNumber,
    };
  }

  public isSyncing() {
    return {
      method: 'eth_syncing',
      format: outputSyncingFormatter,
    };
  }

  public getGasPrice() {
    return {
      method: 'eth_gasPrice',
      format: outputBigNumberFormatter,
    };
  }

  public getAccounts() {
    return {
      method: 'eth_accounts',
      format: result => result.map(Address.toChecksumAddress),
    };
  }

  public getBlockNumber() {
    return {
      method: 'eth_blockNumber',
      format: hexToNumber,
    };
  }

  public getBalance(address: Address, block?: BlockType) {
    return {
      method: 'eth_getBalance',
      params: [address.toString().toLowerCase(), inputBlockNumberFormatter(this.resolveBlock(block))],
      format: outputBigNumberFormatter,
    };
  }

  public getStorageAt(address: Address, position: string, block?: BlockType) {
    return {
      method: 'eth_getStorageAt',
      params: [
        address.toString().toLowerCase(),
        numberToHex(position),
        inputBlockNumberFormatter(this.resolveBlock(block)),
      ],
      format: identity,
    };
  }

  public getCode(address: Address, block?: BlockType) {
    return {
      method: 'eth_getCode',
      params: [address.toString().toLowerCase(), inputBlockNumberFormatter(this.resolveBlock(block))],
      format: identity,
    };
  }

  public getBlock(block: BlockType | BlockHash, returnTransactionObjects: boolean = false) {
    return {
      method: isString(block) && isHexStrict(block) ? 'eth_getBlockByHash' : 'eth_getBlockByNumber',
      params: [inputBlockNumberFormatter(this.resolveBlock(block)), returnTransactionObjects],
      format: outputBlockFormatter,
    };
  }

  public getUncle(block: BlockType | BlockHash, uncleIndex: number, returnTransactionObjects: boolean = false) {
    return {
      method:
        isString(block) && isHexStrict(block) ? 'eth_getUncleByBlockHashAndIndex' : 'eth_getUncleByBlockNumberAndIndex',
      params: [inputBlockNumberFormatter(this.resolveBlock(block)), numberToHex(uncleIndex), returnTransactionObjects],
      format: outputBlockFormatter,
    };
  }

  public getBlockTransactionCount(block: BlockType | BlockHash) {
    return {
      method:
        isString(block) && isHexStrict(block)
          ? 'eth_getBlockTransactionCountByHash'
          : 'eth_getBlockTransactionCountByNumber',
      params: [inputBlockNumberFormatter(this.resolveBlock(block))],
      format: hexToNumber,
    };
  }

  public getBlockUncleCount(block: BlockType | BlockHash) {
    return {
      method: isString(block) && isHexStrict(block) ? 'eth_getUncleCountByBlockHash' : 'eth_getUncleCountByBlockNumber',
      params: [inputBlockNumberFormatter(this.resolveBlock(block))],
      format: hexToNumber,
    };
  }

  public getTransaction(hash: TransactionHash) {
    return {
      method: 'eth_getTransactionByHash',
      params: [hash],
      format: outputTransactionFormatter,
    };
  }

  public getTransactionFromBlock(block: BlockType | BlockHash, index: number) {
    return {
      method:
        isString(block) && isHexStrict(block)
          ? 'eth_getTransactionByBlockHashAndIndex'
          : 'eth_getTransactionByBlockNumberAndIndex',
      params: [inputBlockNumberFormatter(block), numberToHex(index)],
      format: outputTransactionFormatter,
    };
  }

  public getTransactionReceipt(hash: TransactionHash) {
    return {
      method: 'eth_getTransactionReceipt',
      params: [hash],
      format: outputTransactionReceiptFormatter,
    };
  }

  public getTransactionCount(address: Address, block?: BlockType) {
    return {
      method: 'eth_getTransactionCount',
      params: [address.toString().toLowerCase(), inputBlockNumberFormatter(this.resolveBlock(block))],
      format: hexToNumber,
    };
  }

  public signTransaction(tx: Tx) {
    tx.from = tx.from || this.defaultFromAddress;
    return {
      method: 'eth_signTransaction',
      params: [inputTransactionFormatter(tx)],
      format: identity,
    };
  }

  public sendSignedTransaction(data: Data) {
    return {
      method: 'eth_sendRawTransaction',
      params: [data],
      format: identity,
    };
  }

  public sendTransaction(tx: Tx) {
    tx.from = tx.from || this.defaultFromAddress;
    return {
      method: 'eth_sendTransaction',
      params: [inputTransactionFormatter(tx)],
      format: identity,
    };
  }

  public sign(address: Address, dataToSign: Data) {
    return {
      method: 'eth_sign',
      params: [address.toString().toLowerCase(), inputSignFormatter(dataToSign)],
      format: identity,
    };
  }

  public signTypedData(address: Address, dataToSign: { type: string; name: string; value: string }[]) {
    return {
      method: 'eth_signTypedData',
      params: [dataToSign, address.toString().toLowerCase()],
      format: identity,
    };
  }

  public call(callObject: Tx, block?: BlockType) {
    return {
      method: 'eth_call',
      params: [inputCallFormatter(callObject), inputBlockNumberFormatter(this.resolveBlock(block))],
      format: identity,
    };
  }

  public estimateGas(tx: Tx) {
    tx.from = tx.from || this.defaultFromAddress;
    return {
      method: 'eth_estimateGas',
      params: [inputCallFormatter(tx)],
      format: hexToNumber,
    };
  }

  public submitWork(nonce: string, powHash: string, digest: string) {
    return {
      method: 'eth_submitWork',
      params: [nonce, powHash, digest],
      format: identity,
    };
  }

  public getWork() {
    return {
      method: 'eth_getWork',
      format: identity,
    };
  }

  public getPastLogs(options: GetLogOptions) {
    return {
      method: 'eth_getLogs',
      params: [inputLogFormatter(options)],
      format: result => result.map(outputLogFormatter),
    };
  }

  private resolveBlock(block?: BlockType | BlockHash) {
    return block === undefined ? this.defaultBlock : block;
  }
}
