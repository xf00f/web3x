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

import { EventEmitter } from 'events';
import { EthereumProvider } from './ethereum-provider';

export class MockEthereumProvider extends EventEmitter implements EthereumProvider {
  public send = jest.fn();

  constructor() {
    super();
    /*
    this.on.mockImplementation((subscription, callback) => {
      this.on(id, callback);
    });

    this.removeSubscription.mockImplementation((id, callback) => {
      this.send(
        {
          method: 'eth_unsubscribe',
          params: [id],
        },
        callback,
      );
      this.provider.removeAllListeners(id);
    });

    this.clearSubscriptions.mockImplementation(id => {
      this.provider.removeAllListeners();
    });
    */
  }
}
