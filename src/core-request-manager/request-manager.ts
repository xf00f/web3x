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
 * @file index.js
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */

import { isString, isArray } from 'util';
import { errors } from '../core-helpers';
import * as Jsonrpc from './jsonrpc';
import { givenProvider } from './givenProvider';
import { WebsocketProvider, HttpProvider, IpcProvider, Provider } from '../providers';

export interface IRequestManager {
  send(data, callback?): Promise<any>;
  sendBatch(data, callback);
  addSubscription(id, name, type, callback);
  removeSubscription(id, callback?);
  clearSubscriptions(keepIsSyncing: boolean);
  close();
}

/**
 * It's responsible for passing messages to providers
 * It's also responsible for polling the ethereum node for incoming messages
 * Default poll timeout is 1 second
 * Singleton
 */
export class RequestManager {
  public provider!: Provider;
  private subscriptions: any;
  public static providers = {
    WebsocketProvider,
    HttpProvider,
    IpcProvider,
  };
  public static givenProvider = givenProvider;

  constructor(provider: Provider | string) {
    this.setProvider(provider);
    this.subscriptions = {};
  }

  /**
   * Should be used to set provider of request manager
   *
   * @method setProvider
   * @param {Object} p
   */
  private setProvider(p: Provider | string, net?: any) {
    // autodetect provider
    // HTTP
    if (isString(p)) {
      if (/^http(s)?:\/\//i.test(p)) {
        this.provider = new HttpProvider(p);
      } else if (/^ws(s)?:\/\//i.test(p)) {
        this.provider = new WebsocketProvider(p);
      } else if (p && typeof net.connect === 'function') {
        this.provider = new IpcProvider(p, net);
      } else if (p) {
        throw new Error('Can\'t autodetect provider for "' + p + '"');
      }
    } else {
      this.provider = p;
    }

    // listen to incoming notifications
    if (this.provider && this.provider.on) {
      this.provider.on('data', result => {
        // check for result.method, to prevent old providers errors to pass as result
        if (
          result.method &&
          this.subscriptions[result.params.subscription] &&
          this.subscriptions[result.params.subscription].callback
        ) {
          this.subscriptions[result.params.subscription].callback(null, result.params.result);
        }
      });
    }
  }

  /**
   * Should be used to asynchronously send request
   *
   * @method sendAsync
   * @param {Object} data
   * @param {Function} callback
   */
  async send(data, callback?): Promise<any> {
    return new Promise((resolve, reject) => {
      callback = callback || function() {};

      if (!this.provider) {
        const err = errors.InvalidProvider();
        callback(err);
        reject(err);
        return;
      }

      const payload = Jsonrpc.toPayload(data.method, data.params);
      this.provider.send(payload, function(err, result) {
        if (!result) {
          err = new Error('No result.');
        } else if (result.id && payload.id !== result.id) {
          err = new Error(
            'Wrong response id "' + result.id + '" (expected: "' + payload.id + '") in ' + JSON.stringify(payload),
          );
        } else if (result.error) {
          err = errors.ErrorResponse(result);
        } else if (!Jsonrpc.isValidResponse(result)) {
          err = errors.InvalidResponse(result);
        } else {
          callback(null, result.result);
          resolve(result.result);
        }

        callback(err);
        reject(err);
        return;
      });
    });
  }

  /**
   * Should be called to asynchronously send batch request
   *
   * @method sendBatch
   * @param {Array} batch data
   * @param {Function} callback
   */
  sendBatch(data, callback) {
    if (!this.provider) {
      return callback(errors.InvalidProvider());
    }

    var payload = Jsonrpc.toBatchPayload(data);
    this.provider.send(payload, function(err, results) {
      if (err) {
        return callback(err);
      }

      if (!isArray(results)) {
        return callback(errors.InvalidResponse(results));
      }

      callback(null, results);
    });
  }

  /**
   * Waits for notifications
   *
   * @method addSubscription
   * @param {String} id           the subscription id
   * @param {String} name         the subscription name
   * @param {String} type         the subscription namespace (eth, personal, etc)
   * @param {Function} callback   the callback to call for incoming notifications
   */
  addSubscription(id, name, type, callback) {
    if (this.provider.on) {
      this.subscriptions[id] = {
        callback: callback,
        type: type,
        name: name,
      };
    } else {
      throw new Error("The provider doesn't support subscriptions: " + this.provider.constructor.name);
    }
  }

  /**
   * Waits for notifications
   *
   * @method removeSubscription
   * @param {String} id           the subscription id
   * @param {Function} callback   fired once the subscription is removed
   */
  removeSubscription(id, callback?) {
    var _this = this;

    if (this.subscriptions[id]) {
      this.send(
        {
          method: this.subscriptions[id].type + '_unsubscribe',
          params: [id],
        },
        callback,
      );

      // remove subscription
      delete _this.subscriptions[id];
    }
  }

  /**
   * Should be called to reset the subscriptions
   *
   * @method reset
   */
  clearSubscriptions(keepIsSyncing: boolean = false) {
    var _this = this;

    // uninstall all subscriptions
    Object.keys(this.subscriptions).forEach(function(id) {
      if (!keepIsSyncing || _this.subscriptions[id].name !== 'syncing') _this.removeSubscription(id);
    });

    //  reset notification callbacks etc.
    if (this.provider.reset) this.provider.reset();
  }

  close() {
    this.provider.disconnect();
  }
}
