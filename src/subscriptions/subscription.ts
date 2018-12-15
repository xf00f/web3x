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
import { EthereumProvider } from '../providers/ethereum';

export class Subscription<Result> extends EventEmitter {
  private id?: string;
  private reconnectIntervalId: any;

  constructor(readonly subscription: string, readonly params: any[], private provider: EthereumProvider) {
    super();
  }

  on(event: 'rawdata' | 'data' | 'changed', listener: (result: Result) => void): this {
    return super.on(event, listener);
  }

  once(event: 'rawdata' | 'data' | 'changed', listener: (result: Result) => void): this {
    return super.once(event, listener);
  }

  /**
   * Unsubscribes and clears callbacks
   */
  unsubscribe(callback?) {
    this.provider.removeSubscription(this.id, callback);
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
  async subscribe(subscription: string, options?: any, callback?: Callback<Result>) {
    var payload = {
      method: this.options.type + '_subscribe',
      params: [subscription, options],
    };

    // if id is there unsubscribe first
    if (this.id) {
      this.unsubscribe();
    }

    // store the params in the options object
    this.options.params = payload.params[1];

    // get past logs, if fromBlock is available
    /* move to subscribeLogs
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
    if (typeof payload.params[1] === 'object') delete payload.params[1].fromBlock;
    */

    try {
      const result = await this.options.requestManager.send(payload);

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
    } catch (err) {
      this.callback(err, null, this);
      this.emit('error', err);
    }

    // return an object to cancel the subscription
    return this;
  }
}
