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
import { TransactionReceipt } from '../formatters';
import { TransactionHash } from '../types';
import { BlockHeader } from './block';
import { Eth } from './eth';
import { EthRequestPayload } from './eth-request-payloads';
import { Tx } from './tx';

export interface SendTx<TxReceipt = TransactionReceipt> {
  getTxHash(): Promise<TransactionHash>;
  getReceipt(
    numConfirmations?: number,
    confirmationCallback?: (conf: number, receipt: TxReceipt) => void,
  ): Promise<TxReceipt>;
}

export abstract class BaseSendTx implements SendTx {
  private txHash?: string;
  private receipt?: TransactionReceipt | null;
  private blocksSinceSent = 0;

  constructor(protected eth: Eth) {}

  public async getTxHash(): Promise<TransactionHash> {
    if (this.txHash) {
      return this.txHash;
    }

    const { method, params, format } = await this.getPayload();
    this.txHash = format(await this.eth.provider.send(method, params));
    return this.txHash!;
  }

  public async getReceipt(
    numConfirmations: number = 1,
    confirmationCallback?: (conf: number, receipt: TransactionReceipt) => void,
  ): Promise<TransactionReceipt> {
    if (this.receipt) {
      return this.receipt;
    }

    return new Promise<TransactionReceipt>(async (resolve, reject) => {
      try {
        const txHash = await this.getTxHash();
        this.receipt = await this.eth.getTransactionReceipt(txHash);

        if (this.receipt) {
          this.receipt = await this.handleReceipt(this.receipt);
          if (numConfirmations === 1) {
            if (confirmationCallback) {
              confirmationCallback(1, this.receipt);
            }
            resolve(this.receipt);
            return;
          }
        }

        this.eth
          .subscribe('newBlockHeaders')
          .on('data', async (blockHeader: BlockHeader, sub) => {
            try {
              this.blocksSinceSent++;

              if (!this.receipt) {
                this.receipt = await this.eth.getTransactionReceipt(txHash);
                if (this.receipt) {
                  this.receipt = await this.handleReceipt(this.receipt);
                }
              }

              if (!this.receipt) {
                if (this.blocksSinceSent > 50) {
                  sub.unsubscribe();
                  reject(new Error('No receipt after 50 blocks.'));
                }
                return;
              }

              const confirmations = 1 + blockHeader.number - this.receipt.blockNumber;

              if (confirmationCallback) {
                confirmationCallback(confirmations, this.receipt);
              }

              if (confirmations >= numConfirmations) {
                sub.unsubscribe();
                resolve(this.receipt);
              }
            } catch (err) {
              sub.unsubscribe();
              reject(err);
            }
          })
          .on('error', reject);
      } catch (err) {
        reject(err);
      }
    });
  }

  protected abstract async getPayload(): Promise<EthRequestPayload>;

  protected async handleReceipt(receipt: TransactionReceipt) {
    if (receipt.status === false) {
      throw new Error('Transaction has been reverted by the EVM.');
    }
    return receipt;
  }
}

export class SendTransaction extends BaseSendTx {
  constructor(eth: Eth, private tx: Tx) {
    super(eth);
  }

  public async getPayload() {
    const account = this.getAccount(this.tx.from);

    if (!this.tx.gasPrice) {
      this.tx.gasPrice = await this.eth.getGasPrice();
    }

    if (!account) {
      return this.eth.request.sendTransaction(this.tx);
    } else {
      const { from, ...fromlessTx } = this.tx;
      const signedTx = await account.signTransaction(fromlessTx, this.eth);
      return this.eth.request.sendSignedTransaction(signedTx.rawTransaction);
    }
  }

  private getAccount(address?: Address) {
    address = address || this.eth.defaultFromAddress;
    if (this.eth.wallet && address) {
      return this.eth.wallet.get(address.toString());
    }
  }
}

export class SendSignedTransaction extends BaseSendTx {
  constructor(eth: Eth, private payload: EthRequestPayload) {
    super(eth);
  }

  public async getPayload() {
    return this.payload;
  }
}
