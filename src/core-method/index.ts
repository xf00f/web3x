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
/**
 * @file index.js
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @author Marek Kotewicz <marek@parity.io>
 * @date 2017
 */

import { isFunction, isArray } from 'util';
import { errors } from '../core-helpers';
import { call } from './call';
import { PromiEvent } from '../core-promievent';
import { IRequestManager } from '../core-request-manager';
import { Accounts } from '../eth/accounts';
import { BlockType } from '../types';
import { Address } from '../types';

interface Call {
  (...args: any[]): PromiEvent<any>;
  method: Method;
  request(): any;
}

interface MethodOptions {
  requestManager?: IRequestManager;
  name: string;
  call: string | ((args: any) => any);
  params?: number;
  inputFormatter?: any;
  outputFormatter?: any;
  transformPayload?: any;
  extraFormatters?: any;
  accounts?: Accounts;
  defaultBlock?: BlockType;
  defaultAccount?: Address;
}

export class Method {
  public name: any;
  public call: any;
  public params: any;
  public inputFormatter: any;
  public outputFormatter: any;
  public transformPayload: any;
  public extraFormatters: any;
  public requestManager: any;
  public accounts: any;
  public defaultBlock: any;
  public defaultAccount: any;

  constructor(options: MethodOptions) {
    if (!options.call || !options.name) {
      throw new Error('When creating a method you need to provide at least the "name" and "call" property.');
    }

    this.name = options.name;
    this.call = options.call;
    this.params = options.params || 0;
    this.inputFormatter = options.inputFormatter;
    this.outputFormatter = options.outputFormatter;
    this.transformPayload = options.transformPayload;
    this.extraFormatters = options.extraFormatters;
    this.requestManager = options.requestManager;
    this.accounts = options.accounts;

    this.defaultBlock = options.defaultBlock || 'latest';
    this.defaultAccount = options.defaultAccount || null;
  }

  createFunction() {
    const sendFunc = <Call>((...args: any[]) => {
      const payload = this.toPayload(...args);
      return call(this.call, payload, this.accounts, this.requestManager, this.outputFormatter, this.extraFormatters);
    });

    // necessary to attach things to the method
    sendFunc.method = this;
    // necessary for batch requests
    sendFunc.request = this.request.bind(this);

    return sendFunc;
  }

  /**
   * Should be called to create the pure JSONRPC request which can be used in a batch request
   *
   * @method request
   * @return {Object} jsonrpc request
   */
  request(...args: any[]) {
    const payload: any = this.toPayload(...args);
    payload.format = this.formatOutput.bind(this);
    return payload;
  }

  /**
   * Should be called to check if the number of arguments is correct
   *
   * @method validateArgs
   * @param {Array} arguments
   * @throws {Error} if it is not
   */
  validateArgs(args) {
    if (args.length !== this.params) {
      throw errors.InvalidNumberOfParams(args.length, this.params, this.name);
    }
  }

  /**
   * Should be called to format output(result) of method
   *
   * @method formatOutput
   * @param {Object}
   * @return {Object}
   */
  formatOutput(result) {
    if (isArray(result)) {
      return result.map(res => {
        return this.outputFormatter && res ? this.outputFormatter(res) : res;
      });
    } else {
      return this.outputFormatter && result ? this.outputFormatter(result) : result;
    }
  }

  /**
   * Should create payload from given input args
   *
   * @method toPayload
   * @param {Array} args
   * @return {Object}
   */
  toPayload(...args: any[]) {
    var params = this.formatInput(args);
    this.validateArgs(params);

    var payload = {
      method: this.call,
      params: params,
    };

    if (this.transformPayload) {
      payload = this.transformPayload(payload);
    }

    return payload;
  }

  /**
   * Should be called to format input args of method
   *
   * @method formatInput
   * @param {Array}
   * @return {Array}
   */
  formatInput(args) {
    if (!this.inputFormatter) {
      return args;
    }

    return this.inputFormatter.map((formatter, index) => {
      // bind this for defaultBlock, and defaultAccount
      return formatter ? formatter.call(this, args[index]) : args[index];
    });
  }
}
