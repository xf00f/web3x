import { toBigIntBE, toBufferBE } from 'bigint-buffer';
import BN from 'bn.js';
import { LevelUp } from 'levelup';
import * as rlp from 'rlp';
import { Address } from '../../address';
import { bufferToHex, hexToBuffer, recover, sha3Buffer } from '../../utils';
import { EvmContext } from '../evm-context';
import { run } from '../run';
import { Trie } from '../trie';
import { TxSubstrate } from '../tx/tx-substrate';

export class AccountState {
  constructor(
    public nonce: number = 0,
    public balance: bigint = BigInt(0),
    public storageRoot: Buffer = Buffer.of(),
    public codeHash: Buffer = Buffer.of(),
  ) {}

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

function evmAccountFactory(accounts: Trie, address: Address, state: AccountState, storage: Trie, code: Buffer) {
  switch (address.toString()) {
    case '0x0000000000000000000000000000000000000001':
      return new EvmEcdsaRecoveryAccount(accounts, address, state, storage, code);
    default:
      return new EvmAccount(accounts, address, state, storage, code);
  }
}

export class EvmAccount {
  constructor(
    protected accounts: Trie,
    public address: Address,
    public state: AccountState,
    public storage: Trie,
    public code: Buffer,
  ) {}

  public static fromNew(db: LevelUp, accounts: Trie, address: Address, value: bigint = BigInt(0), nonce: number = 0) {
    const state = new AccountState(nonce, value, Buffer.of(), sha3Buffer(''));
    const storage = new Trie(db);
    const code = Buffer.of();
    return new EvmAccount(accounts, address, state, storage, code);
  }

  public static async load(address: Address | bigint, accounts: Trie) {
    address = address instanceof Address ? address : new Address(toBufferBE(address, 20));
    const fromAccountRlp = await accounts.get(address.toBuffer());

    if (!fromAccountRlp) {
      throw new Error('Account not found.');
    }

    const state = AccountState.fromRlp(fromAccountRlp);
    const storage = new Trie(accounts.db, state.storageRoot);
    const code = (await storage.get(state.codeHash)) || Buffer.of();

    return evmAccountFactory(accounts, address, state, storage, code);
  }

  public async store() {
    this.state.codeHash = sha3Buffer(this.code);
    await this.storage.put(this.state.codeHash, this.code);
    this.state.storageRoot = this.storage.root;
    await this.accounts.put(this.address.toBuffer(), this.state.toRlp());
  }

  public nextContractAddress() {
    return new Address(sha3Buffer(rlp.encode([this.address.toBuffer(), this.state.nonce])).slice(12));
  }

  public async run(
    calldata: Buffer,
    sender: Address,
    caller: Address,
    value: bigint,
    gas: bigint,
    txSubstrate: TxSubstrate,
  ) {
    const callContext = new EvmContext(
      this.accounts,
      this.code,
      calldata,
      sender,
      caller,
      this.address,
      value,
      gas,
      this.storage,
      txSubstrate,
    );
    return await run(callContext);
  }
}

export class EvmEcdsaRecoveryAccount extends EvmAccount {
  constructor(accounts: Trie, address: Address, state: AccountState, storage: Trie, code: Buffer) {
    super(accounts, address, state, storage, code);
  }

  public static fromNew(accounts: Trie) {
    return new EvmEcdsaRecoveryAccount(
      accounts,
      Address.fromString('0x0000000000000000000000000000000000000001'),
      new AccountState(),
      new Trie(accounts.db),
      Buffer.of(),
    );
  }

  public async run(
    calldata: Buffer,
    sender: Address,
    caller: Address,
    value: bigint,
    gas: bigint,
    txSubstrate: TxSubstrate,
  ) {
    const callContext = new EvmContext(
      this.accounts,
      this.code,
      calldata,
      sender,
      caller,
      this.address,
      value,
      gas,
      this.storage,
      txSubstrate,
    );

    const h = calldata.slice(0, 32);
    const v = calldata.slice(32, 64);
    const r = calldata.slice(64, 96);
    const s = calldata.slice(96, 128);

    const result = hexToBuffer(recover(bufferToHex(h), bufferToHex(v), bufferToHex(r), bufferToHex(s), true));
    const buf = Buffer.alloc(32);
    result.copy(buf, 12);
    callContext.halt = true;
    callContext.returned = buf;

    return callContext;
  }
}
