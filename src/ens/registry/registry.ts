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
