import { toBufferBE } from 'bigint-buffer';
import { LevelUp } from 'levelup';
import { Address } from '../../address';
import { EvmContext } from '../evm-context';
import { run } from '../run';
import { Trie } from '../trie';
import { TxSubstrate } from '../tx/tx-substrate';
import { EvmAccount, EvmEcdsaRecoveryAccount } from './evm-account';

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
    const worldState = new WorldState(db, trie);
    await worldState.installPrecompiledContracts();
    return worldState;
  }

  private async installPrecompiledContracts() {
    const ecdsaRecovery = EvmEcdsaRecoveryAccount.fromNew(this.accounts);
    await ecdsaRecovery.store();
  }

  private async saveStateRoot() {
    await this.db.put('stateRoot', this.accounts.root);
  }

  public async createSimpleAccount(address: Address, value: bigint) {
    const existingAccount = await this.accounts.get(address.toBuffer());

    if (existingAccount) {
      throw new Error('Account already exists.');
    }

    const newAccount = EvmAccount.fromNew(this.db, this.accounts, address, value);
    await newAccount.store();
    await this.saveStateRoot();
    return newAccount;
  }

  public async getOrCreateAccount(address: Address) {
    try {
      return await EvmAccount.load(address, this.accounts);
    } catch (_) {
      return EvmAccount.fromNew(this.db, this.accounts, address, BigInt(0));
    }
  }

  public async createContractAccount(from: Address, code: Buffer, value: bigint) {
    const fromAccount = await EvmAccount.load(from, this.accounts);
    const contractAddr = fromAccount.nextContractAddress();
    const contractAccount = EvmAccount.fromNew(this.db, this.accounts, contractAddr, value, 1);

    fromAccount.state.nonce++;

    const context = await run(
      new EvmContext(
        this.accounts,
        code,
        Buffer.of(),
        from,
        from,
        contractAddr,
        BigInt(0),
        BigInt(0),
        contractAccount.storage,
      ),
    );

    if (context.reverted) {
      throw new Error(`Contract creation transaction reverted at ip: ${context.ip}`);
    }

    contractAccount.code = context.returned;

    await contractAccount.store();
    await fromAccount.store();
    await this.saveStateRoot();

    return contractAddr.toString();
  }

  public async runTransaction(from: Address, to: Address, data: Buffer, value: bigint) {
    const fromAccount = await EvmAccount.load(from, this.accounts);
    const toAccount = await this.getOrCreateAccount(to);

    const txSubstrate = new TxSubstrate();
    txSubstrate.touchedAccounts[from.toString()] = fromAccount;
    txSubstrate.touchedAccounts[to.toString()] = toAccount;

    fromAccount.state.nonce++;

    if (toAccount.code.length > 0) {
      const context = await run(
        new EvmContext(
          this.accounts,
          toAccount.code,
          data,
          from,
          from,
          to,
          BigInt(0),
          BigInt(0),
          toAccount.storage,
          txSubstrate,
        ),
      );

      if (context.reverted) {
        throw new Error(`Transaction reverted at ip: ${context.ip}`);
      }

      await fromAccount.store();
      await toAccount.store();
      await this.saveStateRoot();

      return context.returned;
    } else {
      await fromAccount.store();
      await toAccount.store();
      await this.saveStateRoot();

      return Buffer.of();
    }
  }

  public async call(from: Address, to: Address, data: Buffer) {
    const toAccount = await this.getOrCreateAccount(to);

    if (toAccount.code.length > 0) {
      const context = new EvmContext(
        this.accounts,
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
    const account = await EvmAccount.load(address, this.accounts);
    return account.code;
  }
}
