import { isBoolean } from 'util';
import { formatters } from '../../core-helpers';
import { Method } from '../../core-method';
import { AbiDefinition } from '.';
import { promiEvent } from '../../core-promievent';
import * as utils from '../../utils';
import { abi } from '../abi';
import { IRequestManager } from '../../core-request-manager';
import { toChecksumAddress } from '../../utils';
import { inputAddressFormatter } from '../../core-helpers/formatters';
import { Eth } from '..';
import { BlockType } from '../../types';

export type TxFactory = (...args: any[]) => Tx;

interface CallOptions {
  from?: string;
  gasPrice?: string | number;
  gas?: number;
}

interface SendOptions {
  from: string;
  gasPrice?: string | number;
  gas?: number;
  value?: number | string;
}

interface EstimateOptions {
  from?: string;
  gas?: string | number;
  gasPrice?: string | number;
  value?: number | string;
}

type DefaultOptions = {
  from?: string;
  gasPrice?: string | number;
  gas?: number;
};

/**
 * returns the an object with call, send, estimate functions
 *
 * @method _createTxObject
 * @returns {Object} an object with functions to call the methods
 */
export class Tx {
  constructor(
    private eth: Eth,
    private definition: AbiDefinition,
    private contractAddress: string,
    private args: any[] = [],
    private defaultOptions: DefaultOptions = {},
    private ethAccounts?: any,
    private extraFormatters?: any,
  ) {
    if (this.definition.type !== 'function') {
      throw new Error('Tx should only be used with functions.');
    }

    if (this.defaultOptions.from) {
      this.defaultOptions.from = toChecksumAddress(inputAddressFormatter(this.defaultOptions.from));
    }
  }

  public async estimateGas(options: EstimateOptions = {}) {
    return await this.eth.estimateGas(this.getTx(options));
  }

  public async call(options: CallOptions = {}, block?: BlockType) {
    const result = await this.eth.call(this.getTx(options), block);
    return this.decodeMethodReturn(this.definition.outputs, result);
  }

  public getCallRequestPayload(options: CallOptions, block?: number) {
    const result = this.eth.request.call(this.getTx(options), block);
    return {
      ...result,
      format: result => this.decodeMethodReturn(this.definition.outputs, result),
    };
  }

  public send(options: SendOptions) {
    const tx = this.getTx(options);

    // return error, if no "from" is specified
    if (!utils.isAddress(tx.from)) {
      const defer = promiEvent();
      return utils.fireError(
        new Error('No "from" address specified in neither the given options, nor the default options.'),
        defer.eventEmitter,
        defer.reject,
      );
    }

    if (isBoolean(this.definition.payable) && !this.definition.payable && tx.value && tx.value > 0) {
      const defer = promiEvent();
      return utils.fireError(
        new Error('Can not send value to non-payable contract method or constructor'),
        defer.eventEmitter,
        defer.reject,
      );
    }

    return this.eth.sendTransaction(tx, this.extraFormatters);
  }

  public getSendRequestPayload(options: SendOptions) {
    return this.eth.request.sendTransaction(this.getTx(options));
  }

  private getTx(options) {
    return {
      to: this.contractAddress,
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
  encodeABI() {
    let methodSignature = this.definition.signature;
    let paramsABI = abi.encodeParameters(this.definition.inputs || [], this.args).replace('0x', '');
    return methodSignature + paramsABI;
  }

  /**
   * Decode method return values
   *
   * @method _decodeMethodReturn
   * @param {Array} outputs
   * @param {String} returnValues
   * @return {Object} decoded output return values
   */
  private decodeMethodReturn(outputs, returnValues) {
    if (!returnValues) {
      return null;
    }

    returnValues = returnValues.length >= 2 ? returnValues.slice(2) : returnValues;
    var result = abi.decodeParameters(outputs, returnValues);

    if (result.__length__ === 1) {
      return result[0];
    } else {
      delete result.__length__;
      return result;
    }
  }
}
