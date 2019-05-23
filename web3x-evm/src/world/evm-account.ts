import { toBufferBE } from 'bigint-buffer';
import * as rlp from 'rlp';
import { Address } from 'web3x/address';
import { sha3Buffer } from 'web3x/utils';
import { Trie } from '../trie';
import { EvmContext, run } from '../vm';

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
