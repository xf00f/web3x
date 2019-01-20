import { toBigIntBE, toBufferBE } from 'bigint-buffer';
import BN from 'bn.js';
import { LevelUp } from 'levelup';
import * as rlp from 'rlp';
import { Address } from '../../address';
import { sha3Buffer } from '../../utils';
import { EvmContext } from '../evm-context';
import { run } from '../run';
import { Trie } from '../trie';

export class AccountState {
  constructor(public nonce: number, public balance: bigint, public storageRoot: Buffer, public codeHash: Buffer) {}

  public static fromRlp(data: Buffer) {
    const account: Buffer[] = rlp.decode(data) as any;
    return new AccountState(
      account[0].length ? account[0].readUIntBE(0, account[0].length) : 0,
      toBigIntBE(account[1]),
      account[2],
      account[3],
    );
  }

  public toRlp() {
    return rlp.encode([this.nonce, new BN(this.balance.toString()), this.storageRoot, this.codeHash]);
  }
}

export class EvmAccount {
  constructor(public address: Address, public state: AccountState, public storage: Trie, public code: Buffer) {}

  public static fromNew(db: LevelUp, address: Address, value: bigint = BigInt(0), nonce: number = 0) {
    const state = new AccountState(nonce, value, Buffer.of(), sha3Buffer(''));
    const storage = new Trie(db);
    const code = Buffer.of();
    return new EvmAccount(address, state, storage, code);
  }

  public static async load(address: Address, worldState: WorldState) {
    const fromAccountRlp = await worldState.accounts.get(address.toBuffer());

    if (!fromAccountRlp) {
      throw new Error('Account not found.');
    }

    const state = AccountState.fromRlp(fromAccountRlp);
    const storage = new Trie(worldState.db, state.storageRoot);
    const code = (await storage.get(state.codeHash)) || Buffer.of();

    return new EvmAccount(address, state, storage, code);
  }

  public async store(worldState: WorldState) {
    this.state.codeHash = sha3Buffer(this.code);
    await this.storage.put(this.state.codeHash, this.code);
    this.state.storageRoot = this.storage.root;
    await worldState.accounts.put(this.address.toBuffer(), this.state.toRlp());
  }

  public nextContractAddress() {
    return new Address(sha3Buffer(rlp.encode([this.address.toBuffer(), this.state.nonce])).slice(12));
  }
}

export class WorldState {
  constructor(public db: LevelUp, public accounts: Trie) {}

  public static async fromDb(db: LevelUp) {
    const getStateRoot = async () => {
      try {
        return await db.get('stateRoot');
      } catch (err) {
        return null;
      }
    };
    const stateRoot = await getStateRoot();
    const trie = new Trie(db, stateRoot);
    return new WorldState(db, trie);
  }

  private async saveStateRoot() {
    await this.db.put('stateRoot', this.accounts.root);
  }

  public async loadAccount(address: Address | bigint) {
    const key = address instanceof Address ? address : new Address(toBufferBE(address, 20));
    return await EvmAccount.load(key, this);
  }

  public async createSimpleAccount(address: Address, value: bigint) {
    const existingAccount = await this.accounts.get(address.toBuffer());

    if (existingAccount) {
      throw new Error('Account already exists.');
    }

    const newAccount = EvmAccount.fromNew(this.db, address, value);
    await newAccount.store(this);
    await this.saveStateRoot();
    return newAccount;
  }

  public async getOrCreateAccount(address: Address) {
    try {
      return await this.loadAccount(address);
    } catch (_) {
      return EvmAccount.fromNew(this.db, address, BigInt(0));
    }
  }

  public async createContractAccount(from: Address, code: Buffer, value: bigint) {
    const fromAccount = await this.loadAccount(from);
    const contractAddr = fromAccount.nextContractAddress();
    const contractAccount = EvmAccount.fromNew(this.db, contractAddr, value, 1);
    const context = new EvmContext(
      this,
      code,
      Buffer.of(),
      from,
      from,
      contractAddr,
      BigInt(0),
      BigInt(0),
      contractAccount.storage,
    );

    fromAccount.state.nonce++;

    await run(context);
    contractAccount.code = context.returned;

    await contractAccount.store(this);
    await fromAccount.store(this);
    await this.saveStateRoot();

    return contractAddr.toString();
  }

  public async runTransaction(from: Address, to: Address, data: Buffer, value: bigint) {
    const fromAccount = await EvmAccount.load(from, this);
    const toAccount = await this.getOrCreateAccount(to);

    fromAccount.state.nonce++;

    const returnValue =
      toAccount.code.length > 0
        ? await run(new EvmContext(this, toAccount.code, data, from, from, to, BigInt(0), BigInt(0), toAccount.storage))
        : Buffer.of();

    await fromAccount.store(this);
    await toAccount.store(this);
    await this.saveStateRoot();

    return returnValue;
  }

  public async call(from: Address, to: Address, data: Buffer) {
    const toAccount = await this.getOrCreateAccount(to);

    if (toAccount.code.length > 0) {
      const context = new EvmContext(
        this,
        toAccount.code,
        data,
        from,
        from,
        to,
        BigInt(0),
        BigInt(0),
        toAccount.storage,
      );
      await run(context);
      return context.returned;
    }

    return Buffer.of();
  }

  public async getAccountCode(address: Address) {
    const account = await EvmAccount.load(address, this);
    return account.code;
  }
}
