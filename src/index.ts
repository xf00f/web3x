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

import { Provider } from './providers';
import { Eth } from './eth';
import { RequestManager } from './request-manager';
import { BatchManager } from './request-manager';

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
