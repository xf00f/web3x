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
 * @authors:
 *   Fabian Vogelsteller <fabian@ethereum.org>
 *   Gav Wood <gav@parity.io>
 *   Jeffrey Wilcke <jeffrey.wilcke@ethereum.org>
 *   Marek Kotewicz <marek@parity.io>
 *   Marian Oancea <marian@ethereum.org>
 * @date 2017
 */

import { Provider } from './providers';
import { Eth } from './eth';
import { RequestManager } from './core-request-manager';
import { BatchManager } from './core-request-manager';

export class Web3 {
  private requestManager: RequestManager;
  public eth: Eth;
  public BatchRequest: new () => BatchManager;

  constructor(provider: Provider | string) {
    const requestManager = new RequestManager(provider);
    this.requestManager = requestManager;
    this.eth = new Eth(this.requestManager);

    this.BatchRequest = class extends BatchManager {
      constructor() {
        super(requestManager);
      }
    };
  }

  close() {
    this.requestManager.close();
  }
}
