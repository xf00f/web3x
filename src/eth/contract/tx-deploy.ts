import { isBoolean } from 'util';
import { errors, formatters } from '../../core-helpers';
import { Method } from '../../core-method';
import { AbiDefinition } from '.';
import { promiEvent } from '../../core-promievent';
import * as utils from '../../utils';
import { decodeEventABI } from './decode-event-abi';
import { abi } from '../abi';
import { IRequestManager } from '../../core-request-manager';
import { toChecksumAddress } from '../../utils';
import { inputAddressFormatter } from '../../core-helpers/formatters';

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
  private defaultAccount: any;
  private defaultBlock: any;

  constructor(
    private requestManager: IRequestManager,
    private definition: AbiDefinition,
    private deployData: string,
    private args: any[] = [],
    private defaultOptions: DefaultOptions = {},
    private ethAccounts?: any,
    private extraFormatters?: any,
  ) {
    if (this.defaultOptions.from) {
      this.defaultOptions.from = toChecksumAddress(inputAddressFormatter(this.defaultOptions.from));
    }
  }

  public estimateGas(options: EstimateOptions = {}) {
    var estimateGas = new Method({
      name: 'estimateGas',
      call: 'eth_estimateGas',
      params: 1,
      inputFormatter: [formatters.inputCallFormatter],
      outputFormatter: utils.hexToNumber,
      requestManager: this.requestManager,
      accounts: this.ethAccounts,
      defaultAccount: this.defaultAccount,
      defaultBlock: this.defaultBlock,
    }).createFunction();

    const methodOptions = {
      from: options.from ? toChecksumAddress(inputAddressFormatter(options.from)) : this.defaultOptions.from,
      gasPrice: options.gasPrice || this.defaultOptions.gasPrice,
      value: options.value,
      data: this.encodeABI(),
    };

    return estimateGas(methodOptions);
  }

  public send(options: SendOptions) {
    const methodOptions = {
      from: options.from ? toChecksumAddress(inputAddressFormatter(options.from)) : this.defaultOptions.from,
      gasPrice: options.gasPrice || this.defaultOptions.gasPrice,
      gas: options.gas || this.defaultOptions.gas,
      value: options.value,
      data: this.encodeABI(),
    };

    // return error, if no "from" is specified
    if (!utils.isAddress(methodOptions.from)) {
      const defer = promiEvent();
      return utils.fireError(
        new Error('No "from" address specified in neither the given options, nor the default options.'),
        defer.eventEmitter,
        defer.reject,
      );
    }

    if (
      isBoolean(this.definition.payable) &&
      !this.definition.payable &&
      methodOptions.value &&
      methodOptions.value > 0
    ) {
      const defer = promiEvent();
      return utils.fireError(
        new Error('Can not send value to non-payable contract method or constructor'),
        defer.eventEmitter,
        defer.reject,
      );
    }

    var sendTransaction = new Method({
      name: 'sendTransaction',
      call: 'eth_sendTransaction',
      params: 1,
      inputFormatter: [formatters.inputTransactionFormatter],
      requestManager: this.requestManager,
      accounts: this.ethAccounts,
      defaultAccount: this.defaultAccount,
      defaultBlock: this.defaultBlock,
      extraFormatters: this.extraFormatters,
    }).createFunction();

    return sendTransaction(methodOptions);
  }

  public getRequestPayload(options: SendOptions) {
    const methodOptions = {
      from: options.from ? toChecksumAddress(inputAddressFormatter(options.from)) : this.defaultOptions.from,
      gasPrice: options.gasPrice || this.defaultOptions.gasPrice,
      gas: options.gas || this.defaultOptions.gas,
      value: options.value,
      data: this.encodeABI(),
    };

    var payload: any = {
      params: [formatters.inputCallFormatter({ from: this.defaultAccount, methodOptions })],
    };
    payload.method = 'eth_sendTransaction';
    return payload;
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
