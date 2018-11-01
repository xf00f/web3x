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

import { ENS } from '../ens';
import { Contract } from '../../contract';
import { namehash } from './namehash';
import { REGISTRY_ABI, RegistryDefinition } from './abi/registry';
import { RESOLVER_ABI, ResolverDefinition } from './abi/resolver';

/**
 * A wrapper around the ENS registry contract.
 *
 * @method Registry
 * @param {Ens} ens
 * @constructor
 */
export class Registry {
  private contract: Promise<Contract<RegistryDefinition>>;

  constructor(private ens: ENS) {
    this.contract = ens
      .checkNetwork()
      .then(address => new Contract<RegistryDefinition>(ens.eth, REGISTRY_ABI, address));
  }

  /**
   * Returns the address of the owner of an ENS name.
   *
   * @method owner
   * @param {string} name
   * @param {function} callback
   * @return {Promise<any>}
   */
  async owner(name: string) {
    const contract = await this.contract;
    return await contract.methods.owner(namehash(name)).call();
  }

  /**
   * Returns the resolver contract associated with a name.
   *
   * @method resolver
   * @param {string} name
   * @return {Promise<Contract>}
   */
  async resolver(name: string) {
    const contract = await this.contract;
    const address = await contract.methods.resolver(namehash(name)).call();
    return new Contract<ResolverDefinition>(this.ens.eth, RESOLVER_ABI, address);
  }
}
