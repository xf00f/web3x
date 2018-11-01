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

import { config } from './config';
import { Registry } from './registry';
import { Eth } from '../eth';
import { namehash } from './registry/namehash';
import { Address } from '../types';
import { SendOptions } from '../contract';
import { Net } from '../net';

/**
 * Constructs a new instance of ENS
 *
 * @method ENS
 * @param {Object} eth
 * @constructor
 */
export class ENS {
  private registry = new Registry(this);
  private net: Net;

  constructor(readonly eth: Eth) {
    this.net = new Net(eth);
  }

  getRegistry() {
    return this.registry;
  }

  /**
   * @param {string} name
   * @returns {Promise<Contract>}
   */
  getResolver(name: string) {
    return this.registry.resolver(name);
  }

  /**
   * Returns the address record associated with a name.
   *
   * @method getAddress
   * @param {string} name
   * @param {function} callback
   * @return {eventifiedPromise}
   */
  async getAddress(name: string) {
    const resolver = await this.registry.resolver(name);
    return await resolver.methods.addr(namehash(name)).call();
  }

  /**
   * Sets a new address
   *
   * @method setAddress
   * @param {string} name
   * @param {string} address
   * @param {Object} sendOptions
   * @param {function} callback
   * @returns {eventifiedPromise}
   */
  async setAddress(name: string, address: Address, sendOptions: SendOptions) {
    const resolver = await this.registry.resolver(name);
    return await resolver.methods.setAddr(namehash(name), address).send(sendOptions);
  }

  /**
   * Returns the public key
   *
   * @method getPubkey
   * @param {string} name
   * @param {function} callback
   * @returns {eventifiedPromise}
   */
  async getPubkey(name: string) {
    const resolver = await this.registry.resolver(name);
    return await resolver.methods.pubkey(namehash(name)).call();
  }

  /**
   * Set the new public key
   *
   * @method setPubkey
   * @param {string} name
   * @param {string} x
   * @param {string} y
   * @param {Object} sendOptions
   * @param {function} callback
   * @returns {eventifiedPromise}
   */
  async setPubkey(name: string, x: string, y: string, sendOptions: SendOptions) {
    const resolver = await this.registry.resolver(name);
    return await resolver.methods.setPubkey(namehash(name), x, y).send(sendOptions);
  }

  /**
   * Returns the content
   *
   * @method getContent
   * @param {string} name
   * @param {function} callback
   * @returns {eventifiedPromise}
   */
  async getContent(name: string) {
    const resolver = await this.registry.resolver(name);
    return await resolver.methods.content(namehash(name)).call();
  }

  /**
   * Set the content
   *
   * @method setContent
   * @param {string} name
   * @param {string} hash
   * @param {function} callback
   * @param {Object} sendOptions
   * @returns {eventifiedPromise}
   */
  async setContent(name: string, hash: string, sendOptions: SendOptions) {
    const resolver = await this.registry.resolver(name);
    return await resolver.methods.setContent(namehash(name), hash).send(sendOptions);
  }

  /**
   * Get the multihash
   *
   * @method getMultihash
   * @param {string} name
   * @param {function} callback
   * @returns {eventifiedPromise}
   */
  async getMultihash(name: string) {
    const resolver = await this.registry.resolver(name);
    return await resolver.methods.multihash(namehash(name)).call();
  }

  /**
   * Set the multihash
   *
   * @method setMultihash
   * @param {string} name
   * @param {string} hash
   * @param {Object} sendOptions
   * @param {function} callback
   * @returns {eventifiedPromise}
   */
  async setMultihash(name: string, hash: string, sendOptions: SendOptions) {
    const resolver = await this.registry.resolver(name);
    return await resolver.methods.setMultihash(namehash(name), hash).send(sendOptions);
  }

  /**
   * Checks if the current used network is synced and looks for ENS support there.
   * Throws an error if not.
   *
   * @returns {Promise<Block>}
   */
  async checkNetwork() {
    const block = await this.eth.getBlock('latest');
    const headAge = new Date().getTime() / 1000 - block.timestamp;
    if (headAge > 3600) {
      throw new Error('Network not synced; last block was ' + headAge + ' seconds ago');
    }
    const networkType = await this.net.getNetworkType();
    const addr: string = config.addresses[networkType];
    if (typeof addr === 'undefined') {
      throw new Error('ENS is not supported on network ' + networkType);
    }

    return addr;
  }
}
