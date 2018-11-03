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

import { isFunction, isObject, isArray } from 'util';
import { EventEmitter } from 'events';
import { Callback } from '../types';
import { InvalidNumberOfParams } from '../errors';

export class Subscription<Result> extends EventEmitter {
  public id: any;
  public callback: any;
  public arguments: any;
  public _reconnectIntervalId: any;
  public options: any;
  public subscriptionMethod: any;

  constructor(options: any) {
    super();

    this.id = null;
    this.callback = x => x;
    this.arguments = null;
    this._reconnectIntervalId = null;

    this.options = {
      subscription: options.subscription,
      type: options.type,
      requestManager: options.requestManager,
    };
  }

  on(event: 'data' | 'changed', listener: (result: Result) => void): this {
    return super.on(event, listener);
  }

  once(event: 'data' | 'changed', listener: (result: Result) => void): this {
    return super.once(event, listener);
  }

  /**
   * Should be used to extract callback from array of arguments. Modifies input param
   *
   * @method extractCallback
   * @param {Array} arguments
   * @return {Function|Null} callback, if exists
   */

  private _extractCallback(args) {
    if (isFunction(args[args.length - 1])) {
      return args.pop(); // modify the args array!
    }
  }

  /**
   * Should be called to check if the number of arguments is correct
   *
   * @method validateArgs
   * @param {Array} arguments
   * @throws {Error} if it is not
   */

  private _validateArgs(args) {
    var subscription = this.options.subscription;

    if (!subscription) subscription = {};

    if (!subscription.params) subscription.params = 0;

    if (args.length !== subscription.params) {
      throw InvalidNumberOfParams(args.length, subscription.params, args[0]);
    }
  }

  /**
   * Should be called to format input args of method
   *
   * @method formatInput
   * @param {Array}
   * @return {Array}
   */

  private _formatInput(args) {
    var subscription = this.options.subscription;

    if (!subscription) {
      return args;
    }

    if (!subscription.inputFormatter) {
      return args;
    }

    var formattedArgs = subscription.inputFormatter.map(function(formatter, index) {
      return formatter ? formatter(args[index]) : args[index];
    });

    return formattedArgs;
  }

  /**
   * Should be called to format output(result) of method
   *
   * @method formatOutput
   * @param {Object}
   * @return {Object}
   */

  private _formatOutput(result) {
    var subscription = this.options.subscription;

    return subscription && subscription.outputFormatter && result ? subscription.outputFormatter(result) : result;
  }

  /**
   * Should create payload from given input args
   *
   * @method toPayload
   * @param {Array} args
   * @return {Object}
   */
  private _toPayload(args) {
    var params: any[] = [];
    this.callback = this._extractCallback(args) || (x => x);

    if (!this.subscriptionMethod) {
      this.subscriptionMethod = args.shift();

      // replace subscription with given name
      if (this.options.subscription.subscriptionName) {
        this.subscriptionMethod = this.options.subscription.subscriptionName;
      }
    }

    if (!this.arguments) {
      this.arguments = this._formatInput(args);
      this._validateArgs(this.arguments);
      args = []; // make empty after validation
    }

    // re-add subscriptionName
    params.push(this.subscriptionMethod);
    params = params.concat(this.arguments);

    if (args.length) {
      throw new Error('Only a callback is allowed as parameter on an already instantiated subscription.');
    }

    return {
      method: this.options.type + '_subscribe',
      params: params,
    };
  }

  /**
   * Unsubscribes and clears callbacks
   *
   * @method unsubscribe
   * @return {Object}
   */
  unsubscribe(callback?) {
    this.options.requestManager.removeSubscription(this.id, callback);
    this.id = null;
    this.removeAllListeners();
    clearInterval(this._reconnectIntervalId);
  }

  /**
   * Subscribes and watches for changes
   *
   * @method subscribe
   * @param {String} subscription the subscription
   * @param {Object} options the options object with address topics and fromBlock
   * @return {Object}
   */
  subscribe(subscription: string, options?: object | Callback<Result>, callback?: Callback<Result>) {
    var args = Array.prototype.slice.call(arguments);
    var payload = this._toPayload(args);

    if (!payload) {
      return this;
    }

    if (!this.options.requestManager.provider) {
      var err1 = new Error('No provider set.');
      this.callback(err1, null, this);
      this.emit('error', err1);
      return this;
    }

    // throw error, if provider doesnt support subscriptions
    if (!this.options.requestManager.provider.on) {
      var err2 = new Error(
        "The current provider doesn't support subscriptions: " + this.options.requestManager.provider.constructor.name,
      );
      this.callback(err2, null, this);
      this.emit('error', err2);
      return this;
    }

    // if id is there unsubscribe first
    if (this.id) {
      this.unsubscribe();
    }

    // store the params in the options object
    this.options.params = payload.params[1];

    // get past logs, if fromBlock is available
    if (
      payload.params[0] === 'logs' &&
      isObject(payload.params[1]) &&
      payload.params[1].hasOwnProperty('fromBlock') &&
      isFinite(payload.params[1].fromBlock)
    ) {
      // send the subscription request
      this.options.requestManager
        .send({
          method: 'eth_getLogs',
          params: [payload.params[1]],
        })
        .then(logs => {
          logs.forEach(log => {
            var output = this._formatOutput(log);
            this.callback(null, output, this);
            this.emit('data', output);
          });
        })
        .catch(err => {
          // TODO subscribe here? after the past logs?
          this.callback(err, null, this);
          this.emit('error', err);
        });
    }

    // create subscription
    // TODO move to separate function? so that past logs can go first?

    if (typeof payload.params[1] === 'object') delete payload.params[1].fromBlock;

    this.options.requestManager
      .send(payload)
      .then(result => {
        if (!result) {
          throw new Error('No result');
        }
        this.id = result;

        // call callback on notifications
        this.options.requestManager.addSubscription(this.id, payload.params[0], this.options.type, (err, result) => {
          if (!err) {
            if (!isArray(result)) {
              result = [result];
            }

            result.forEach(resultItem => {
              var output = this._formatOutput(resultItem);

              if (isFunction(this.options.subscription.subscriptionHandler)) {
                return this.options.subscription.subscriptionHandler.call(this, output);
              } else {
                this.emit('data', output);
              }

              // call the callback, last so that unsubscribe there won't affect the emit above
              this.callback(null, output, this);
            });
          } else {
            // unsubscribe, but keep listeners
            this.options.requestManager.removeSubscription(this.id);

            // re-subscribe, if connection fails
            if (this.options.requestManager.provider.once) {
              this._reconnectIntervalId = setInterval(() => {
                // TODO check if that makes sense!
                if (this.options.requestManager.provider.reconnect) {
                  this.options.requestManager.provider.reconnect();
                }
              }, 500);

              this.options.requestManager.provider.once('connect', () => {
                clearInterval(this._reconnectIntervalId);
                this.subscribe(this.callback);
              });
            }
            this.emit('error', err);

            // call the callback, last so that unsubscribe there won't affect the emit above
            this.callback(err, null, this);
          }
        });
      })
      .catch(err => {
        this.callback(err, null, this);
        this.emit('error', err);
      });

    // return an object to cancel the subscription
    return this;
  }
}
