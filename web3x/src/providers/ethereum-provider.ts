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

export type EthereumProviderNotifications = 'notification' | 'connect' | 'close' | 'networkChanged' | 'accountsChanged';

export interface EthereumProvider {
  send(method: string, params?: any[]): Promise<any>;

  on(notification: 'notification', listener: (result: any) => void): this;
  on(notification: 'connect', listener: () => void): this;
  on(notification: 'close', listener: (code: number, reason: string) => void): this;
  on(notification: 'networkChanged', listener: (networkId: string) => void): this;
  on(notification: 'accountsChanged', listener: (accounts: string[]) => void): this;

  removeListener(notification: 'notification', listener: (result: any) => void): this;
  removeListener(notification: 'connect', listener: () => void): this;
  removeListener(notification: 'close', listener: (code: number, reason: string) => void): this;
  removeListener(notification: 'networkChanged', listener: (networkId: string) => void): this;
  removeListener(notification: 'accountsChanged', listener: (accounts: string[]) => void): this;

  removeAllListeners(notification: EthereumProviderNotifications);
}
