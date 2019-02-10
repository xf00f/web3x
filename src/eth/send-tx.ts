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

import { BlockHeaderResponse, TransactionReceipt } from '../formatters';
import { TransactionHash } from '../types';
import { Eth } from './eth';

export interface SendTx<TxReceipt = TransactionReceipt> {
  getTxHash(): Promise<TransactionHash>;
  getReceipt(
    numConfirmations?: number,
    confirmationCallback?: (conf: number, receipt: TxReceipt) => void,
  ): Promise<TxReceipt>;
}

export class SentTransaction implements SendTx {
  private receipt?: TransactionReceipt | null;
  private blocksSinceSent = 0;

  constructor(protected eth: Eth, protected txHashPromise: Promise<TransactionHash>) {}

  public async getTxHash(): Promise<TransactionHash> {
    return this.txHashPromise;
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
          .on('data', async (blockHeader: BlockHeaderResponse, sub) => {
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

              const confirmations = 1 + blockHeader.number! - this.receipt.blockNumber;

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

  protected async handleReceipt(receipt: TransactionReceipt) {
    if (receipt.status === false) {
      throw new Error('Transaction has been reverted by the EVM.');
    }
    return receipt;
  }
}
