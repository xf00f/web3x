import { LevelUp } from 'levelup';
import { Address } from '../../../address';
import { bufferToHex, recover } from '../../../utils';
import { Trie } from '../../trie';
import { EvmContext } from '../../vm';
import { EvmAccount } from '../evm-account';

export class EcdsaRecoveryAccount extends EvmAccount {
  constructor(address: Address, nonce: bigint, balance: bigint, storage: Trie, code: Buffer) {
    super(address, nonce, balance, storage, code);
  }

  public static fromDb(db: LevelUp) {
    return new EcdsaRecoveryAccount(
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
