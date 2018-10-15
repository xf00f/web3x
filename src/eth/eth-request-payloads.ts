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

import { toChecksumAddress, numberToHex, hexToNumber, isHexStrict } from '../utils';
import {
  inputAddressFormatter,
  outputSyncingFormatter,
  outputBigNumberFormatter,
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
import { isString } from 'util';
import { Tx, BlockType, BlockHash, TransactionHash } from '../types';
import { Data, Address } from '../types';

const identity = result => result;

export class EthRequestPayloads {
  constructor(private defaultBlock: BlockType) {}

  getId() {
    return {
      method: 'net_version',
      format: hexToNumber,
    };
  }

  getNodeInfo() {
    return {
      method: 'web3_clientVersion',
      format: identity,
    };
  }

  getProtocolVersion() {
    return {
      method: 'eth_protocolVersion',
      format: identity,
    };
  }

  getCoinbase() {
    return {
      method: 'eth_coinbase',
      format: identity,
    };
  }

  isMining() {
    return {
      method: 'eth_mining',
      format: identity,
    };
  }

  getHashrate() {
    return {
      method: 'eth_hashrate',
      format: hexToNumber,
    };
  }

  isSyncing() {
    return {
      method: 'eth_syncing',
      format: outputSyncingFormatter,
    };
  }

  getGasPrice() {
    return {
      method: 'eth_gasPrice',
      format: outputBigNumberFormatter,
    };
  }

  getAccounts() {
    return {
      method: 'eth_accounts',
      format: result => result.map(toChecksumAddress),
    };
  }

  getBlockNumber() {
    return {
      method: 'eth_blockNumber',
      format: hexToNumber,
    };
  }

  getBalance(address: Address, block?: BlockType) {
    return {
      method: 'eth_getBalance',
      params: [inputAddressFormatter(address), inputBlockNumberFormatter(this.resolveBlock(block))],
      format: outputBigNumberFormatter,
    };
  }

  getStorageAt(address: Address, position: string, block?: BlockType) {
    return {
      method: 'eth_getStorageAt',
      params: [
        inputAddressFormatter(address),
        numberToHex(position),
        inputBlockNumberFormatter(this.resolveBlock(block)),
      ],
      format: identity,
    };
  }

  getCode(address: Address, block?: BlockType) {
    return {
      method: 'eth_getCode',
      params: [inputAddressFormatter(address), inputBlockNumberFormatter(this.resolveBlock(block))],
      format: identity,
    };
  }

  getBlock(block: BlockType | BlockHash, returnTransactionObjects: boolean = false) {
    return {
      method: isString(block) && isHexStrict(block) ? 'eth_getBlockByHash' : 'eth_getBlockByNumber',
      params: [inputBlockNumberFormatter(this.resolveBlock(block)), returnTransactionObjects],
      format: outputBlockFormatter,
    };
  }

  getUncle(block: BlockType | BlockHash, uncleIndex: number, returnTransactionObjects: boolean = false) {
    return {
      method:
        isString(block) && isHexStrict(block) ? 'eth_getUncleByBlockHashAndIndex' : 'eth_getUncleByBlockNumberAndIndex',
      params: [inputBlockNumberFormatter(this.resolveBlock(block)), numberToHex(uncleIndex), returnTransactionObjects],
      format: outputBlockFormatter,
    };
  }

  getBlockTransactionCount(block: BlockType | BlockHash) {
    return {
      method:
        isString(block) && isHexStrict(block)
          ? 'eth_getBlockTransactionCountByHash'
          : 'eth_getBlockTransactionCountByNumber',
      params: inputBlockNumberFormatter(this.resolveBlock(block)),
      format: hexToNumber,
    };
  }

  getBlockUncleCount(block: BlockType | BlockHash) {
    return {
      method: isString(block) && isHexStrict(block) ? 'eth_getUncleCountByBlockHash' : 'eth_getUncleCountByBlockNumber',
      params: inputBlockNumberFormatter(this.resolveBlock(block)),
      format: hexToNumber,
    };
  }

  getTransaction(hash: TransactionHash) {
    return {
      method: 'eth_getTransactionByHash',
      params: [hash],
      format: outputTransactionFormatter,
    };
  }

  getTransactionFromBlock(block: BlockType | BlockHash, index: number) {
    return {
      method:
        isString(block) && isHexStrict(block)
          ? 'eth_getTransactionByBlockHashAndIndex'
          : 'eth_getTransactionByBlockNumberAndIndex',
      params: [inputBlockNumberFormatter(block), numberToHex(index)],
      format: outputTransactionFormatter,
    };
  }

  getTransactionReceipt(hash: TransactionHash) {
    return {
      method: 'eth_getTransactionReceipt',
      params: [hash],
      format: outputTransactionReceiptFormatter,
    };
  }

  getTransactionCount(address: Address, block?: BlockType) {
    return {
      method: 'eth_getTransactionCount',
      params: [inputAddressFormatter(address), inputBlockNumberFormatter(this.resolveBlock(block))],
      format: hexToNumber,
    };
  }

  signTransaction(tx: Tx) {
    return {
      method: 'eth_signTransaction',
      params: [inputTransactionFormatter(tx)],
      format: identity,
    };
  }

  sendSignedTransaction(data: Data) {
    return {
      method: 'eth_sendRawTransaction',
      params: [data],
      format: identity,
    };
  }

  sendTransaction(tx: Tx) {
    return {
      method: 'eth_sendTransaction',
      params: [inputTransactionFormatter(tx)],
      format: identity,
    };
  }

  sign(address: Address, dataToSign: Data) {
    return {
      method: 'eth_sign',
      params: [inputSignFormatter(dataToSign), inputAddressFormatter(address)],
      format: identity,
    };
  }

  call(callObject: Tx, block?: BlockType, outputFormatter = result => result) {
    return {
      method: 'eth_call',
      params: [inputCallFormatter(callObject), inputBlockNumberFormatter(this.resolveBlock(block))],
      format: outputFormatter,
    };
  }

  estimateGas(tx: Tx) {
    return {
      method: 'eth_estimateGas',
      params: [inputCallFormatter(tx)],
      format: hexToNumber,
    };
  }

  submitWork(nonce: string, powHash: string, digest: string) {
    return {
      method: 'eth_submitWork',
      params: [nonce, powHash, digest],
      format: identity,
    };
  }

  getWork() {
    return {
      method: 'eth_getWork',
      format: identity,
    };
  }

  getPastLogs(options: {
    fromBlock?: BlockType;
    toBlock?: BlockType;
    address?: string;
    topics?: Array<string | string[]>;
  }) {
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
