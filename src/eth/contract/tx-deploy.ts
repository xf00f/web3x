import { isBoolean } from 'util';
import { AbiDefinition } from '.';
import { promiEvent, PromiEvent } from '../../core-promievent';
import * as utils from '../../utils';
import { abi } from '../abi';
import { toChecksumAddress } from '../../utils';
import { inputAddressFormatter } from '../../core-helpers/formatters';
import { Eth } from '..';

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
    private extraFormatters?: any,
  ) {
    if (this.defaultOptions.from) {
      this.defaultOptions.from = toChecksumAddress(inputAddressFormatter(this.defaultOptions.from));
    }
  }

  public async estimateGas(options: EstimateOptions = {}) {
    return await this.eth.estimateGas(this.getTx(options));
  }

  public send(options: SendOptions): PromiEvent<any> {
    const tx = this.getTx(options);

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

  public getRequestPayload(options: SendOptions) {
    return this.eth.request.sendTransaction(this.getTx(options));
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
