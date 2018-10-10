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

import { Method } from '../core-method';
import * as utils from '../utils';
import { Eth } from '../eth';

export class Net {
  constructor(private eth: Eth) {}

  getId(): Promise<number> {
    const method = new Method({
      name: 'getId',
      call: 'net_version',
      params: 0,
      outputFormatter: utils.hexToNumber,
      requestManager: this.eth.requestManager,
    }).createFunction();

    return method();
  }

  isListening(): Promise<boolean> {
    const method = new Method({
      name: 'isListening',
      call: 'net_listening',
      params: 0,
      requestManager: this.eth.requestManager,
    }).createFunction();

    return method();
  }

  getPeerCount(): Promise<number> {
    const method = new Method({
      name: 'getPeerCount',
      call: 'net_peerCount',
      params: 0,
      outputFormatter: utils.hexToNumber,
      requestManager: this.eth.requestManager,
    }).createFunction();

    return method();
  }

  async getNetworkType() {
    const block = await this.eth.getBlock(0);
    const genesisHash = block.hash;
    const id = await this.getId();

    if (genesisHash === '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3' && id === 1) {
      return 'main';
    } else if (genesisHash === '0cd786a2425d16f152c658316c423e6ce1181e15c3295826d7c9904cba9ce303' && id === 2) {
      return 'morden';
    } else if (genesisHash === '0x41941023680923e0fe4d74a34bdac8141f2540e3ae90623718e47d66d1ca4a2d' && id === 3) {
      return 'ropsten';
    } else if (genesisHash === '0x6341fd3daf94b748c72ced5a5b26028f2474f5f00d824504e4fa37a75767e177' && id === 4) {
      return 'rinkeby';
    } else if (genesisHash === '0xa3c565fc15c7478862d50ccd6561e3c06b24cc509bf388941c25ea985ce32cb9' && id === 42) {
      return 'kovan';
    } else {
      return 'private';
    }
  }
}
