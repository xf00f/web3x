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
 * @file contract.js
 *
 * To initialize a contract use:
 *
 *  var Contract = require('web3-eth-contract');
 *  Contract.setProvider('ws://localhost:8546');
 *  var contract = new Contract(abi, address, ...);
 *
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */

import { isArray, isFunction } from 'util';
import { Method } from '../../core-method';
import { Subscription } from '../../core-subscriptions';
import { formatters, errors } from '../../core-helpers';
import { abi, jsonInterfaceMethodToString } from '../abi';
import { Tx, TxFactory } from './tx';
import { decodeAnyEvent, EventLog } from './decode-event-abi';
import { IRequestManager } from '../../core-request-manager';
import { inputAddressFormatter } from '../../core-helpers/formatters';
import { toChecksumAddress, isAddress } from '../../utils';
import { Accounts } from '../accounts';
import { TxDeploy } from './tx-deploy';
import { ContractAbi, AbiDefinition } from './contract-abi';
import { Address, Data } from '../../types';
import { BlockType } from '../../types';

export interface ContractOptions {
  from?: string;
  gasPrice?: string;
  gas?: number;
}

type EventSubscriptionFactory = (
  options?: object,
  callback?: (err: Error, result: EventLog, subscription: Subscription<EventLog>) => void,
) => Subscription<any>;

/**
 * Should be called to create new contract instance
 *
 * @method Contract
 * @constructor
 * @param {Array} jsonInterface
 * @param {String} address
 * @param {Object} options
 */
export class Contract {
  readonly methods: { [key: string]: TxFactory } = {};
  readonly events: { [key: string]: EventSubscriptionFactory } = {};
  private options: ContractOptions;
  private extraFormatters;

  constructor(
    private requestManager: IRequestManager,
    private jsonInterface: ContractAbi,
    public address?: string,
    private ethAccounts?: Accounts,
    defaultOptions: ContractOptions = {},
  ) {
    this.setAbiDefinition(jsonInterface);

    const { gasPrice, from, gas } = defaultOptions;
    this.options = {
      gas,
      gasPrice,
      from: from ? toChecksumAddress(inputAddressFormatter(from)) : undefined,
    };

    if (address) {
      this.setAddress(address);
    }

    this.extraFormatters = {
      receiptFormatter: this.receiptFormatter,
      contractDeployFormatter: this.contractDeployFormatter,
    };
  }

  /**
   * Deploys a contract and fire events based on its state: transactionHash, receipt
   * contract.deploy(data, 1, 2).send({ from: 0x123... });
   *
   * All event listeners will be removed, once the last possible event is fired ("error", or "receipt")
   */
  deploy(data: Data, ...args: any[]) {
    const constructor: AbiDefinition = this.jsonInterface.find(method => method.type === 'constructor') || {
      type: 'constructor',
    };
    constructor.signature = 'constructor';

    return new TxDeploy(
      this.requestManager,
      constructor,
      data,
      args,
      this.options,
      this.ethAccounts,
      this.extraFormatters,
    );
  }

  /**
   * Adds event listeners and creates a subscription, and remove it once its fired.
   *
   * @method once
   * @param {String} event
   * @param {Object} options
   * @param {Function} callback
   * @return {Object} the event subscription
   */
  once(
    event: string,
    options: {
      filter?: object;
      topics?: string[];
    },
    callback: (err, res, sub) => void,
  ) {
    // don't return as once shouldn't provide "on"
    this.on(event, options, (err, res, sub) => {
      sub.unsubscribe();
      callback(err, res, sub);
    });
  }

  /**
   * Get past events from contracts
   *
   * @method getPastEvents
   * @param {String} event
   * @param {Object} options
   * @param {Function} callback
   * @return {Object} the promievent
   */
  getPastEvents(
    event: string,
    options?: {
      filter?: object;
      fromBlock?: BlockType;
      toBlock?: BlockType;
      topics?: string[];
    },
  ): Promise<EventLog[]> {
    var subOptions = this.generateEventOptions(event, options);

    var getPastLogs: any = new Method({
      name: 'getPastLogs',
      call: 'eth_getLogs',
      params: 1,
      inputFormatter: [formatters.inputLogFormatter],
      outputFormatter: log => decodeAnyEvent(this.jsonInterface, log),
      requestManager: this.requestManager,
    });
    var call = getPastLogs.buildCall();

    getPastLogs = null;

    return call(subOptions.params, subOptions.callback);
  }

  private executorFactory(definition: AbiDefinition, nextOverload?: TxFactory): TxFactory {
    return (...args: any[]): Tx => {
      if (!this.address) {
        throw new Error('No contract address.');
      }
      if (
        (!args && definition.inputs && definition.inputs.length > 0) ||
        (definition.inputs && args.length !== definition.inputs.length)
      ) {
        if (nextOverload) {
          return nextOverload(...args);
        }
        throw errors.InvalidNumberOfParams(args.length, definition.inputs.length, definition.name);
      }
      return new Tx(
        this.requestManager,
        definition,
        this.address,
        args,
        this.options,
        this.ethAccounts,
        this.extraFormatters,
      );
    };
  }

  private setAddress(address: Address) {
    this.address = toChecksumAddress(inputAddressFormatter(address));
  }

  private setAbiDefinition(contractDefinition: ContractAbi) {
    this.jsonInterface = contractDefinition.map(method => {
      let func: TxFactory;

      // make constant and payable backwards compatible
      method.constant = method.stateMutability === 'view' || method.stateMutability === 'pure' || method.constant;
      method.payable = method.stateMutability === 'payable' || method.payable;

      // function
      if (method.type === 'function') {
        const name = method.name!;
        const funcName = jsonInterfaceMethodToString(method);
        method.signature = abi.encodeFunctionSignature(funcName);
        func = this.executorFactory(method);

        // add method only if not one already exists
        if (!this.methods[name]) {
          this.methods[name] = func;
        } else {
          const cascadeFunc = this.executorFactory(method, this.methods[name]);
          this.methods[name] = cascadeFunc;
        }

        // definitely add the method based on its signature
        this.methods[method.signature!] = func;

        // add method by name
        this.methods[funcName] = func;

        // event
      } else if (method.type === 'event') {
        const name = method.name!;
        const funcName = jsonInterfaceMethodToString(method);
        method.signature = abi.encodeEventSignature(funcName);
        var event = this.on.bind(this, method.signature);

        // add method only if not already exists
        if (!this.events[name] || this.events[name].name === 'bound ') this.events[name] = event;

        // definitely add the method based on its signature
        this.events[method.signature!] = event;

        // add event by name
        this.events[funcName] = event;
      }

      return method;
    });

    // add allEvents
    this.events.allEvents = this.on.bind(this, 'allevents');

    return this.jsonInterface;
  }

  /**
   * Checks that no listener with name "newListener" or "removeListener" is added.
   *
   * @method _checkListener
   * @param {String} type
   * @param {String} event
   * @return {Object} the contract instance
   */
  private checkListener(type, event) {
    if (event === type) {
      throw new Error('The event "' + type + '" is a reserved event name, you can\'t use it.');
    }
  }

  /**
   * Should be used to encode indexed params and options to one final object
   *
   * @method _encodeEventABI
   * @param {Object} event
   * @param {Object} options
   * @return {Object} everything combined together and encoded
   */
  private encodeEventABI(event, options) {
    options = options || {};
    var filter = options.filter || {},
      result: any = {};

    ['fromBlock', 'toBlock']
      .filter(f => {
        return options[f] !== undefined;
      })
      .forEach(f => {
        result[f] = formatters.inputBlockNumberFormatter(options[f]);
      });

    // use given topics
    if (isArray(options.topics)) {
      result.topics = options.topics;

      // create topics based on filter
    } else {
      result.topics = [];

      // add event signature
      if (event && !event.anonymous && event.name !== 'ALLEVENTS') {
        result.topics.push(event.signature);
      }

      // add event topics (indexed arguments)
      if (event.name !== 'ALLEVENTS') {
        var indexedTopics = event.inputs
          .filter(i => {
            return i.indexed === true;
          })
          .map(i => {
            var value = filter[i.name];
            if (!value) {
              return null;
            }

            // TODO: https://github.com/ethereum/web3.js/issues/344
            // TODO: deal properly with components

            if (isArray(value)) {
              return value.map(v => {
                return abi.encodeParameter(i.type, v);
              });
            }
            return abi.encodeParameter(i.type, value);
          });

        result.topics = result.topics.concat(indexedTopics);
      }

      if (!result.topics.length) delete result.topics;
    }

    if (this.address) {
      result.address = this.address.toLowerCase();
    }

    return result;
  }

  /**
   * Gets the event signature and outputformatters
   *
   * @method _generateEventOptions
   * @param {Object} event
   * @param {Object} options
   * @param {Function} callback
   * @return {Object} the event options object
   */
  private generateEventOptions(eventName: string = 'allevents', options, callback?) {
    let event: any =
      eventName.toLowerCase() === 'allevents'
        ? {
            name: 'ALLEVENTS',
            jsonInterface: this.jsonInterface,
          }
        : this.jsonInterface.find(json => {
            return (
              json.type === 'event' &&
              (json.name === eventName || json.signature === '0x' + eventName.replace('0x', ''))
            );
          });

    if (!event) {
      throw new Error('Event "' + event.name + '" doesn\'t exist in this contract.');
    }

    if (!isAddress(this.address)) {
      throw new Error("This contract object doesn't have address set yet, please set an address first.");
    }

    return {
      params: this.encodeEventABI(event, options),
      event: event,
      callback: callback,
    };
  }

  /**
   * Adds event listeners and creates a subscription.
   *
   * @method _on
   * @param {String} event
   * @param {Object} options
   * @param {Function} callback
   * @return {Object} the event subscription
   */
  private on(event, options, callback) {
    var subOptions = this.generateEventOptions(event, options, callback);

    // prevent the event "newListener" and "removeListener" from being overwritten
    this.checkListener('newListener', subOptions.event.name);
    this.checkListener('removeListener', subOptions.event.name);

    // TODO check if listener already exists? and reuse subscription if options are the same.

    // create new subscription
    var subscription = new Subscription({
      subscription: {
        params: 1,
        inputFormatter: [formatters.inputLogFormatter],
        outputFormatter: log => decodeAnyEvent(this.jsonInterface, log),
        // DUBLICATE, also in web3-eth
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
      type: 'eth',
      requestManager: this.requestManager,
    });
    subscription.subscribe('logs', subOptions.params, subOptions.callback || function() {});

    return subscription;
  }

  private contractDeployFormatter = receipt => {
    this.setAddress(receipt.contractAddress);
    return this;
  };

  private receiptFormatter = receipt => {
    if (isArray(receipt.logs)) {
      // decode logs
      const events = receipt.logs.map(log => decodeAnyEvent(this.jsonInterface, log));
      //const events = receipt.logs.map(log => (log.id !== undefined ? log : decodeAnyEvent(this.jsonInterface, log)));

      // make log names keys
      receipt.events = {};
      var count = 0;
      events.forEach(function(ev: any) {
        if (ev.event) {
          // if > 1 of the same event, don't overwrite any existing events
          if (receipt.events[ev.event]) {
            if (Array.isArray(receipt.events[ev.event])) {
              receipt.events[ev.event].push(ev);
            } else {
              receipt.events[ev.event] = [receipt.events[ev.event], ev];
            }
          } else {
            receipt.events[ev.event] = ev;
          }
        } else {
          receipt.events[count] = ev;
          count++;
        }
      });

      delete receipt.logs;
    }
    return receipt;
  };
}
