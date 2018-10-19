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

import { Provider, HttpProvider, WebsocketProvider, IpcProvider } from './providers';
import { Eth } from './eth';
import { RequestManager } from './request-manager';
import { BatchManager } from './request-manager';
import { Personal } from './personal';
import { Net } from './net';
import { Contract, ContractAbi, ContractOptions } from './contract';
import { Accounts, Wallet } from './accounts';
import { isString } from 'util';

/*
  Included for backwards compatability with web3.js, but do the right thing and construct the
  modules you want explicitly. Your build sizes will thank you for it.
*/
export class Web3 {
  private requestManager: RequestManager;
  readonly eth: Eth;
  readonly BatchRequest: new () => BatchManager;

  constructor(provider: Provider | string, net?: any) {
    provider = this.getProvider(provider, net);
    const requestManager = new RequestManager(provider);
    this.requestManager = requestManager;

    const eth = new Eth(this.requestManager);
    eth.net = new Net(eth);
    eth.personal = new Personal(this.requestManager);
    eth.accounts = new Accounts(eth);
    eth.wallet = eth.accounts.wallet = new Wallet(eth);
    eth.Contract = class extends Contract {
      constructor(abi: ContractAbi, address?: string, options?: ContractOptions) {
        super(eth, abi, address, options, eth.accounts!.wallet);
      }
    };
    this.eth = eth;

    this.BatchRequest = eth.BatchRequest = class extends BatchManager {
      constructor() {
        super(requestManager);
      }
    };
  }

  private getProvider(provider: Provider | string, net?: any): Provider {
    if (!isString(provider)) {
      return provider;
    }

    if (/^http(s)?:\/\//i.test(provider)) {
      return new HttpProvider(provider);
    } else if (/^ws(s)?:\/\//i.test(provider)) {
      return new WebsocketProvider(provider);
    } else if (provider && typeof net.connect === 'function') {
      return new IpcProvider(provider, net);
    } else {
      throw new Error(`Can't autodetect provider for ${provider}`);
    }
  }

  close() {
    this.requestManager.close();
  }
}
