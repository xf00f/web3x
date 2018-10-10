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

import { Subscription } from './subscription';
import { RequestManager } from '../core-request-manager';

export { Subscription };

export class Subscriptions {
  public name: string;
  public type: string;
  public subscriptions: any;

  constructor(options, public requestManager?: RequestManager) {
    this.name = options.name;
    this.type = options.type;
    this.subscriptions = options.subscriptions || {};
    this.requestManager = options.requestManager;
  }

  createFunction() {
    return (...args: any[]) => {
      if (!this.subscriptions[args[0]]) {
        console.warn('Subscription ' + JSON.stringify(args[0]) + " doesn't exist. Subscribing anyway.");
      }

      const subscription = new Subscription({
        subscription: this.subscriptions[args[0]],
        requestManager: this.requestManager,
        type: this.type,
      });

      return subscription.subscribe.apply(subscription, args);
    };
  }
}
