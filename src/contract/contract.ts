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

import { isArray } from 'util';
import { Subscription } from '../subscriptions';
import { abi, abiMethodToString } from './abi';
import { Tx, TxFactory } from './tx';
import { decodeAnyEvent } from './decode-event-abi';
import {
  inputAddressFormatter,
  EventLog,
  inputBlockNumberFormatter,
  TransactionReceipt,
  GetLogOptions,
  FormattedGetLogOptions,
  inputLogFormatter,
} from '../formatters';
import { toChecksumAddress, isAddress } from '../utils';
import { TxDeploy } from './tx-deploy';
import { ContractAbi, AbiDefinition } from './contract-abi';
import { Address, Data } from '../types';
import { Eth, BlockType } from '../eth';
import { InvalidNumberOfParams } from '../errors';
import { Wallet } from '../wallet';

export interface ContractOptions {
  from?: string;
  gasPrice?: string;
  gas?: number;
}

interface ContractDefinition {
  methods: any;
  events?: any;
  eventLogs?: any;
}

export type EventSubscriptionFactory<Result = EventLog<any>> = (
  options?: object,
  callback?: (err: Error, result: Result, subscription: Subscription<Result>) => void,
) => Subscription<Result>;

type Events<T extends ContractDefinition | void> = T extends ContractDefinition
  ? Extract<keyof T['events'], string>
  : string;

type GetEventLog<T extends ContractDefinition | void, P extends Events<T>> = T extends ContractDefinition
  ? T['eventLogs'][P]
  : EventLog<any>;

type GetContractMethods<T> = T extends ContractDefinition ? T['methods'] : { [key: string]: (...args: any[]) => Tx };

type GetContractEvents<T> = T extends ContractDefinition
  ? T['events'] & { allEvents: EventSubscriptionFactory<T['eventLogs'][Events<T>]> }
  : { [key: string]: EventSubscriptionFactory };

/**
 * Should be called to create new contract instance
 *
 * @method Contract
 * @constructor
 * @param {Array} jsonInterface
 * @param {String} address
 * @param {Object} options
 */
export class Contract<T extends ContractDefinition | void = void> {
  readonly methods: GetContractMethods<T>;
  readonly events: GetContractEvents<T>;
  private options: ContractOptions;
  private extraFormatters;

  constructor(
    private eth: Eth,
    private jsonInterface: ContractAbi,
    public address?: string,
    defaultOptions: ContractOptions = {},
    private wallet?: Wallet,
  ) {
    this.jsonInterface = this.getEnrichedAbiDefinition(jsonInterface);
    this.methods = this.getMethods(this.jsonInterface);
    this.events = this.getEvents(this.jsonInterface);

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

    return new TxDeploy(this.eth, constructor, data, args, this.options, this.wallet, this.extraFormatters);
  }

  once<Event extends Events<T>>(
    event: Event,
    options: {
      filter?: object;
      topics?: string[];
    },
    callback: (err, res: GetEventLog<T, Event>, sub) => void,
  );

  /**
   * Adds event listeners and creates a subscription, and remove it once its fired.
   *
   * @method once
   * @param {String} event
   * @param {Object} options
   * @param {Function} callback
   * @return {Object} the event subscription
   */
  once(event: Events<T>, options: GetLogOptions, callback: (err, res, sub) => void): void {
    // don't return as once shouldn't provide "on"
    this.on(event, options, (err, res, sub) => {
      sub.unsubscribe();
      callback(err, res, sub);
    });
  }

  /**
   * Adds event listeners and creates a subscription.
   */
  private on(event: Events<T>, options: GetLogOptions = {}, callback?: (err, res, sub) => void) {
    const logOptions = this.getLogOptions(event, options);
    const { fromBlock, ...subLogOptions } = logOptions;

    var subscription = new Subscription('eth', 'logs', [inputLogFormatter(subLogOptions)], this.eth.provider);

    subscription
      .on('rawdata', log => {
        const output = decodeAnyEvent(this.jsonInterface, log);
        if (output.removed) {
          subscription.emit('changed', output);
        } else {
          subscription.emit('data', output);
        }
        if (callback) {
          callback(undefined, output, subscription);
        }
      })
      .on('error', err => {
        if (callback) {
          callback(err, undefined, subscription);
        }
      });

    if (fromBlock !== undefined) {
      this.eth
        .getPastLogs(logOptions)
        .then(logs => {
          logs.forEach(log => subscription.emit('rawdata', log));
          subscription.subscribe();
        })
        .catch(err => {
          subscription.emit('error', err);
        });
    } else {
      process.nextTick(() => subscription.subscribe());
    }

    return subscription;
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
  async getPastEvents<Event extends Events<T>>(event: Event, options: GetLogOptions): Promise<GetEventLog<T, Event>[]>;
  async getPastEvents(event: Events<T>, options: GetLogOptions = {}): Promise<EventLog<any>[]> {
    const logOptions = this.getLogOptions(event, options);
    const result = await this.eth.getPastLogs(logOptions);
    return result.map(log => decodeAnyEvent(this.jsonInterface, log));
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
        throw InvalidNumberOfParams(args.length, definition.inputs.length, definition.name);
      }
      return new Tx(this.eth, definition, this.address, args, this.options, this.wallet, this.extraFormatters);
    };
  }

  private setAddress(address: Address) {
    this.address = toChecksumAddress(inputAddressFormatter(address));
  }

  private getMethods(contractDefinition: ContractAbi) {
    const methods: any = {};

    contractDefinition
      .filter(method => method.type === 'function')
      .forEach(method => {
        const name = method.name!;
        const funcName = abiMethodToString(method);
        method.signature = abi.encodeFunctionSignature(funcName);
        const func = this.executorFactory(method);

        // add method only if not one already exists
        if (!methods[name]) {
          methods[name] = func;
        } else {
          const cascadeFunc = this.executorFactory(method, methods[name]);
          methods[name] = cascadeFunc;
        }

        // definitely add the method based on its signature
        methods[method.signature!] = func;

        // add method by name
        methods[funcName] = func;
      });

    return methods;
  }

  private getEvents(contractDefinition: ContractAbi) {
    const events: any = {};

    contractDefinition
      .filter(method => method.type === 'event')
      .forEach(method => {
        const name = method.name!;
        const funcName = abiMethodToString(method);
        const event = this.on.bind(this, method.signature);

        // add method only if not already exists
        if (!events[name] || events[name].name === 'bound ') events[name] = event;

        // definitely add the method based on its signature
        events[method.signature!] = event;

        // add event by name
        events[funcName] = event;
      });

    // add allEvents
    events.allEvents = this.on.bind(this, 'allevents');

    return events;
  }

  private getEnrichedAbiDefinition(contractDefinition: ContractAbi) {
    return contractDefinition.map(method => {
      // make constant and payable backwards compatible
      const constant = method.stateMutability === 'view' || method.stateMutability === 'pure' || method.constant;
      const payable = method.stateMutability === 'payable' || method.payable;

      method = {
        ...method,
        constant,
        payable,
      };

      // function
      if (method.type === 'function') {
        method = {
          ...method,
          signature: abi.encodeFunctionSignature(abiMethodToString(method)),
        };
      } else if (method.type === 'event') {
        method = {
          ...method,
          signature: abi.encodeEventSignature(abiMethodToString(method)),
        };
      }

      return method;
    });
  }

  /**
   * Should be used to encode indexed params and options to one final object
   *
   * @method _encodeEventABI
   * @param {Object} event
   * @param {Object} options
   * @return {Object} everything combined together and encoded
   */
  private getEventTopics(event: AbiDefinition, options: GetLogOptions) {
    let topics: Array<string | string[]> = [];

    // add event signature
    if (!event.anonymous && event.signature) {
      topics.push(event.signature);
    }

    // add event topics (indexed arguments)
    (event.inputs || [])
      .filter(input => input.indexed === true)
      .forEach(input => {
        const filter = options.filter || {};
        const value = filter[input.name];
        if (!value) {
          return;
        }

        // TODO: https://github.com/ethereum/web3.js/issues/344
        // TODO: deal properly with components

        if (isArray(value)) {
          const t = value.map(v => abi.encodeParameter(input.type, v));
          topics = [...topics, t];
        } else {
          topics = [...topics, abi.encodeParameter(input.type, value)];
        }
      });

    return topics;
  }

  /**
   * Gets the event signature and outputformatters
   */
  private getLogOptions(eventName: string = 'allevents', options: GetLogOptions): GetLogOptions {
    if (!isAddress(this.address)) {
      throw new Error("This contract object doesn't have address set yet, please set an address first.");
    }

    if (eventName.toLowerCase() === 'allevents') {
      return {
        ...options,
        address: this.address,
      };
    }

    const event = this.jsonInterface.find(
      json =>
        json.type === 'event' && (json.name === eventName || json.signature === '0x' + eventName.replace('0x', '')),
    );

    if (!event) {
      throw new Error('Event "' + eventName + '" doesn\'t exist in this contract.');
    }

    return {
      ...options,
      address: this.address,
      topics: this.getEventTopics(event, options),
    };
  }

  private contractDeployFormatter = receipt => {
    this.setAddress(receipt.contractAddress);
    return receipt;
  };

  private receiptFormatter = (receipt: TransactionReceipt) => {
    if (!isArray(receipt.logs)) {
      return receipt;
    }

    // decode logs
    const decodedEvents = receipt.logs.map(log => decodeAnyEvent(this.jsonInterface, log));

    // make log names keys
    receipt.events = {};
    receipt.unnamedEvents = [];
    var count = 0;
    for (let ev of decodedEvents) {
      if (ev.event) {
        const events = receipt.events[ev.event] || [];
        receipt.events[ev.event] = [...events, ev];
      } else {
        receipt.unnamedEvents = [...receipt.unnamedEvents, ev];
        count++;
      }
    }
    delete receipt.logs;

    return receipt;
  };
}
