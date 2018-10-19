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
import { AbiDefinition } from '.';
import { promiEvent, PromiEvent } from '../promievent';
import * as utils from '../utils';
import { abi } from './abi';
import { toChecksumAddress } from '../utils';
import { inputAddressFormatter } from '../formatters';
import { Eth, SendTxPromiEvent } from '../eth';
import { Wallet } from '../accounts';

interface SendOptions {
  from: string;
  gasPrice?: string | number;
  gas?: number;
  value?: number | string;
}

interface EstimateOptions {
  from?: string;
  gasPrice?: string;
  value?: number | string;
}

type DefaultOptions = {
  from?: string;
  gasPrice?: string;
  gas?: number;
};

/**
 * returns the an object with call, send, estimate functions
 *
 * @method _createTxObject
 * @returns {Object} an object with functions to call the methods
 */
export class TxDeploy {
  constructor(
    private eth: Eth,
    private definition: AbiDefinition,
    private deployData: string,
    private args: any[] = [],
    private defaultOptions: DefaultOptions = {},
    private wallet?: Wallet,
    private extraFormatters?: any,
  ) {
    if (this.defaultOptions.from) {
      this.defaultOptions.from = toChecksumAddress(inputAddressFormatter(this.defaultOptions.from));
    }
  }

  public async estimateGas(options: EstimateOptions = {}) {
    return await this.eth.estimateGas(this.getTx(options));
  }

  public send(options: SendOptions): SendTxPromiEvent {
    const tx = this.getTx(options);

    if (isBoolean(this.definition.payable) && !this.definition.payable && tx.value && tx.value > 0) {
      const defer = promiEvent();
      return utils.fireError(
        new Error('Can not send value to non-payable contract method or constructor'),
        defer.eventEmitter,
        defer.reject,
      );
    }

    const account = this.getAccount(tx.from);

    if (account) {
      return account.sendTransaction(tx, this.extraFormatters);
    } else {
      return this.eth.sendTransaction(tx, this.extraFormatters);
    }
  }

  public getRequestPayload(options: SendOptions) {
    return this.eth.request.sendTransaction(this.getTx(options));
  }

  private getAccount(address?: string) {
    address = address || this.defaultOptions.from;
    if (this.wallet && address) {
      return this.wallet.get(address);
    }
  }

  private getTx(options) {
    return {
      from: options.from ? toChecksumAddress(inputAddressFormatter(options.from)) : this.defaultOptions.from,
      gasPrice: options.gasPrice || this.defaultOptions.gasPrice,
      gas: options.gas || this.defaultOptions.gas,
      value: options.value,
      data: this.encodeABI(),
    };
  }
  /**
   * Encodes an ABI for a method, including signature or the method.
   * Or when constructor encodes only the constructor parameters.
   *
   * @method encodeABI
   * @param {Mixed} args the arguments to encode
   * @param {String} the encoded ABI
   */
  public encodeABI() {
    let paramsABI = abi.encodeParameters(this.definition.inputs || [], this.args).replace('0x', '');
    return this.deployData + paramsABI;
  }
}
