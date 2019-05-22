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
import { Eth } from '../eth';
import { EventLog, fromRawLogResponse, LogRequest, LogResponse, RawLogResponse, toRawLogRequest } from '../formatters';
import { Subscription } from '../subscriptions';
import { Data } from '../types';
import { hexToBuffer } from '../utils';
import { ContractAbi, ContractFunctionEntry } from './abi';
import { Tx, TxFactory } from './tx';
import { TxDeploy } from './tx-deploy';

export interface ContractOptions {
  from?: Address;
  gasPrice?: string | number;
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
  public readonly methods: GetContractMethods<T>;
  public readonly events: GetContractEvents<T>;
  private linkTable: { [name: string]: Address } = {};

  constructor(
    private eth: Eth,
    private contractAbi: ContractAbi,
    public address?: Address,
    private defaultOptions: ContractOptions = {},
  ) {
    this.methods = this.buildMethods();
    this.events = this.buildEvents();
  }

  public link(name: string, address: Address) {
    this.linkTable[name] = address;
  }

  public deployBytecode(data: Data, ...args: any[]) {
    const linkedData = Object.entries(this.linkTable).reduce(
      (data, [name, address]) =>
        data.replace(
          new RegExp(`_+${name}_+`, 'gi'),
          address
            .toString()
            .slice(2)
            .toLowerCase(),
        ),
      data,
    );

    if (linkedData.includes('_')) {
      throw new Error('Bytecode has not been fully linked.');
    }

    return new TxDeploy(
      this.eth,
      this.contractAbi.ctor,
      this.contractAbi,
      hexToBuffer(linkedData),
      args,
      this.defaultOptions,
      addr => (this.address = addr),
    );
  }

  public once<Event extends Events<T>>(
    event: Event,
    options: {
      filter?: object;
      topics?: string[];
    },
    callback: (err, res: GetEventLog<T, Event>, sub) => void,
  );
  public once(event: Events<T>, options: LogRequest, callback: (err, res, sub) => void): void {
    this.on(event, options, (err, res, sub) => {
      sub.unsubscribe();
      callback(err, res, sub);
    });
  }

  public async getPastEvents<Event extends Events<T>>(
    event: Event,
    options: LogRequest,
  ): Promise<GetEventLog<T, Event>[]>;
  public async getPastEvents(event: 'allevents', options: LogRequest): Promise<EventLog<any>[]>;
  public async getPastEvents(event: Events<T> & 'allevents', options: LogRequest = {}): Promise<EventLog<any>[]> {
    const logOptions = this.getLogOptions(event, options);
    const result = await this.eth.getPastLogs(logOptions);
    return result.map(log => this.contractAbi.decodeEvent(log));
  }

  private on(event: string, options: LogRequest = {}, callback?: (err, res, sub) => void) {
    const logOptions = this.getLogOptions(event, options);
    const { fromBlock, ...subLogOptions } = logOptions;
    const params = [toRawLogRequest(subLogOptions)];

    const subscription = new Subscription<LogResponse, RawLogResponse>(
      'eth',
      'logs',
      params,
      this.eth.provider,
      (result, sub) => {
        const output = fromRawLogResponse(result);
        const eventLog = this.contractAbi.decodeEvent(output);
        sub.emit(output.removed ? 'changed' : 'data', eventLog);
        if (callback) {
          callback(undefined, eventLog, sub);
        }
      },
      false,
    );

    subscription.on('error', err => {
      if (callback) {
        callback(err, undefined, subscription);
      }
    });

    if (fromBlock !== undefined) {
      this.eth
        .getPastLogs(logOptions)
        .then(logs => {
          logs.forEach(result => {
            const output = this.contractAbi.decodeEvent(result);
            subscription.emit('data', output);
          });
          subscription.subscribe();
        })
        .catch(err => {
          subscription.emit('error', err);
        });
    } else {
      subscription.subscribe();
    }

    return subscription;
  }

  private executorFactory(functions: ContractFunctionEntry[]): TxFactory {
    return (...args: any[]): Tx => {
      if (!this.address) {
        throw new Error('No contract address.');
      }

      const firstMatchingOverload = functions.find(f => args.length === f.numArgs());

      if (!firstMatchingOverload) {
        throw new Error(`No matching method with ${args.length} arguments for ${functions[0].name}.`);
      }

      return new Tx(this.eth, firstMatchingOverload, this.contractAbi, this.address, args, this.defaultOptions);
    };
  }

  private buildMethods() {
    const methods: any = {};

    this.contractAbi.functions.forEach(f => {
      const executor = this.executorFactory([f]);
      methods[f.asString()] = executor;
      methods[f.signature] = executor;
    });

    const grouped = this.contractAbi.functions.reduce(
      (acc, method) => {
        const funcs = [...(acc[method.name!] || []), method];
        return { ...acc, [method.name!]: funcs };
      },
      {} as { [name: string]: ContractFunctionEntry[] },
    );

    Object.entries(grouped).map(([name, funcs]) => {
      methods[name] = this.executorFactory(funcs);
    });

    return methods;
  }

  private buildEvents() {
    const events: any = {};

    this.contractAbi.events.forEach(e => {
      const event = this.on.bind(this, e.signature!);

      if (!events[e.name!]) {
        events[e.name!] = event;
      }

      events[e.asString()] = event;
      events[e.signature] = event;
    });

    events.allEvents = this.on.bind(this, 'allevents');

    return events;
  }

  private getLogOptions(eventName: string = 'allevents', options: LogRequest): LogRequest {
    if (!this.address) {
      throw new Error('No contract address.');
    }

    if (eventName.toLowerCase() === 'allevents') {
      return {
        ...options,
        address: this.address,
      };
    }

    const event = this.contractAbi.events.find(
      e => e.name === eventName || e.signature === '0x' + eventName.replace('0x', ''),
    );

    if (!event) {
      throw new Error(`Event ${eventName} not found.`);
    }

    return {
      ...options,
      address: this.address,
      topics: event.getEventTopics(options.filter),
    };
  }
}
