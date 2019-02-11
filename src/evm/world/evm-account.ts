import { toBufferBE } from 'bigint-buffer';
import { LevelUp } from 'levelup';
import * as rlp from 'rlp';
import { Address } from '../../address';
import { bufferToHex, hexToBuffer, recover, sha3Buffer } from '../../utils';
import { Trie } from '../trie';
import { EvmContext, run } from '../vm';

export function EvmAccountFactory(address: Address, nonce: bigint, balance: bigint, storage: Trie, code: Buffer) {
  switch (address.toString()) {
    case '0x0000000000000000000000000000000000000001':
      return new EvmEcdsaRecoveryAccount(address, nonce, balance, storage, code);
    default:
      return new EvmAccount(address, nonce, balance, storage, code);
  }
}

export class EvmAccount {
  constructor(
    public readonly address: Address,
    public nonce: bigint,
    public balance: bigint,
    public readonly storage: Trie,
    public code: Buffer,
  ) {}

  public nextContractAddress() {
    return new Address(
      sha3Buffer(rlp.encode([this.address.toBuffer(), toBufferBE(this.nonce - BigInt(1), 32)])).slice(12),
    );
  }

  public async run(context: EvmContext) {
    if (context.code.length === 0) {
      return context;
    }
    return await run(context);
  }

  public isEmpty() {
    return this.code.length === 0 && this.nonce === BigInt(0) && this.balance === BigInt(0);
  }
}

export class EvmEcdsaRecoveryAccount extends EvmAccount {
  constructor(address: Address, nonce: bigint, balance: bigint, storage: Trie, code: Buffer) {
    super(address, nonce, balance, storage, code);
  }

  public static fromDb(db: LevelUp) {
    return new EvmEcdsaRecoveryAccount(
      Address.fromString('0x0000000000000000000000000000000000000001'),
      BigInt(0),
      BigInt(0),
      new Trie(db),
      Buffer.of(),
    );
  }

  public async run(callContext: EvmContext) {
    const { calldata } = callContext;

    const h = calldata.slice(0, 32);
    const v = calldata.slice(32, 64);
    const r = calldata.slice(64, 96);
    const s = calldata.slice(96, 128);

    const result = recover(bufferToHex(h), bufferToHex(v), bufferToHex(r), bufferToHex(s), true).toBuffer32();
    callContext.halt = true;
    callContext.returned = result;

    return callContext;
  }
}
