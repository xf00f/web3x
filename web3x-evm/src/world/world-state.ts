/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { toBufferBE } from 'bigint-buffer';
import { LevelUp } from 'levelup';
import { Address } from 'web3x/address';
import { sha3Buffer } from 'web3x/utils';
import { Trie } from '../trie';
import { AccountState } from './account-state';
import { EvmAccount } from './evm-account';
import { createPrecompilesFromDb, EvmAccountFactory } from './evm-account-factory';

type Immutable<T> = { readonly [P in keyof T]: T[P] };

export class WorldState {
  private checkpoints: { [address: string]: EvmAccount }[] = [];

  constructor(public db: LevelUp, public accounts: Trie) {}

  public static async fromDb(db: LevelUp) {
    const getStateRoot = async () => {
      try {
        return await db.get(Buffer.from('stateRoot'));
      } catch (err) {
        return null;
      }
    };
    const stateRoot = await getStateRoot();
    const trie = new Trie(db, stateRoot);
    const worldState = new WorldState(db, trie);

    if (!stateRoot) {
      await worldState.installPrecompiledContracts();
    }

    return worldState;
  }

  private async installPrecompiledContracts() {
    for (const account of createPrecompilesFromDb(this.accounts.db!)) {
      await this.storeAccount(account);
    }
    await this.saveStateRoot();
  }

  private async saveStateRoot() {
    await this.db.put(Buffer.from('stateRoot'), this.accounts.root);
  }

  public getStateRoot() {
    return this.accounts.root;
  }

  public async createAccount(address: Address, value: bigint, nonce: bigint = BigInt(0), code: Buffer = Buffer.of()) {
    if (this.checkpoints.length === 0) {
      throw new Error('You must checkpoint before potentially modifying state.');
    }

    const existingAccount = await this.loadImmutableAccount(address);

    if (existingAccount) {
      throw new Error('Account already exists.');
    }

    const storage = new Trie(this.accounts.db);
    storage.checkpoint();
    const account = new EvmAccount(address, nonce, value, storage, code);

    this.checkpoints[0][address.toString()] = account;

    return account;
  }

  public async loadOrCreateAccount(address: Address) {
    return (await this.loadAccount(address)) || (await this.createAccount(address, BigInt(0)));
  }

  public async loadImmutableAccount(address: Address) {
    const account: Immutable<EvmAccount> | undefined =
      this.loadCheckpointAccount(address) || (await this.loadPersistedAccount(address));
    return account;
  }

  public async loadAccount(address: Address | bigint) {
    if (this.checkpoints.length === 0) {
      throw new Error('You must checkpoint before potentially modifying state.');
    }

    address = address instanceof Address ? address : new Address(toBufferBE(address, 20));

    const account = this.loadCheckpointAccount(address) || (await this.loadPersistedAccount(address));
    if (!account) {
      return;
    }

    if (!this.checkpoints[0][address.toString()]) {
      account.storage.checkpoint();
      this.checkpoints[0][address.toString()] = account;
    }

    return account;
  }

  private loadCheckpointAccount(address: Address) {
    const addrStr = address.toString();
    const index = this.checkpoints.findIndex(cp => !!cp[addrStr]);
    if (index < 0) {
      return;
    }
    if (index > 0) {
      const { nonce, balance, storage, code } = this.checkpoints[index][addrStr];
      return EvmAccountFactory(address, nonce, balance, storage, code);
    }
    return this.checkpoints[0][addrStr];
  }

  private async loadPersistedAccount(address: Address) {
    const fromAccountRlp = await this.accounts.get(address.toBuffer());

    if (!fromAccountRlp) {
      return;
    }

    const state = AccountState.fromRlp(fromAccountRlp);
    const storage = new Trie(this.accounts.db, state.storageRoot);
    const code = (await storage.get(state.codeHash)) || Buffer.of();
    const account = EvmAccountFactory(address, state.nonce, state.balance, storage, code);

    return account;
  }

  private async storeAccount(account: EvmAccount) {
    const codeHash = sha3Buffer(account.code);
    await account.storage.put(codeHash, account.code);
    const state = new AccountState(account.nonce, account.balance, account.storage.root, codeHash);
    await this.accounts.put(account.address.toBuffer(), state.toRlp());
  }

  public checkpoint() {
    this.accounts.checkpoint();
    this.checkpoints.unshift([] as any);
  }

  public async commit() {
    if (this.checkpoints.length === 0) {
      throw new Error('No checkpoint to commit.');
    } else if (this.checkpoints.length === 1) {
      await Promise.all(Object.entries(this.checkpoints[0]).map(([, account]) => this.storeAccount(account)));
      await Promise.all(Object.entries(this.checkpoints[0]).map(([, account]) => account.storage.commit()));
      await this.accounts.commit();
      await this.saveStateRoot();
    } else {
      await Promise.all(
        Object.entries(this.checkpoints[0]).map(async ([addr, account]) => {
          if (this.checkpoints[1][addr]) {
            await account.storage.commit();
          }
          this.checkpoints[1][addr] = account;
        }),
      );
      await this.accounts.commit();
    }
    this.checkpoints.shift();
  }

  public async revert() {
    if (this.checkpoints.length === 0) {
      throw new Error('No checkpoint to revert.');
    }
    Object.entries(this.checkpoints[0]).map(([, account]) => account.storage.revert());
    this.checkpoints.shift();
  }

  public async getTransactionCount(address: Address) {
    const account = await this.loadImmutableAccount(address);
    return account ? account.nonce : BigInt(0);
  }

  public async accountExists(address: Address) {
    const account = await this.loadImmutableAccount(address);
    return account ? true : false;
  }
}
