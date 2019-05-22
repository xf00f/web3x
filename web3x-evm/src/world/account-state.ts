import { toBigIntBE } from 'bigint-buffer';
import BN from 'bn.js';
import * as rlp from 'rlp';

export class AccountState {
  constructor(
    public readonly nonce: bigint = BigInt(0),
    public readonly balance: bigint = BigInt(0),
    public readonly storageRoot: Buffer = Buffer.of(),
    public readonly codeHash: Buffer = Buffer.of(),
  ) {}

  public static fromRlp(data: Buffer) {
    const account: Buffer[] = rlp.decode(data) as any;
    return new AccountState(
      account[0].length ? toBigIntBE(account[0]) : BigInt(0),
      toBigIntBE(account[1]),
      account[2],
      account[3],
    );
  }

  public toRlp() {
    return rlp.encode([
      new BN(this.nonce.toString()),
      new BN(this.balance.toString()),
      this.storageRoot,
      this.codeHash,
    ]);
  }
}
