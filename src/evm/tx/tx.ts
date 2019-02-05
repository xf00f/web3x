import { toBigIntBE, toBufferBE } from 'bigint-buffer';
import BN from 'bn.js';
import * as rlp from 'rlp';
import { Address } from '../../address';

export interface Tx {
  nonce: bigint;
  to?: Address;
  dataOrInit: Buffer;
  gasPrice: bigint;
  gasLimit: bigint;
  value: bigint;
  v: string;
  r: string;
  s: string;
}

export function serializeTx(tx: Tx) {
  const { nonce, gasPrice, gasLimit, to, value, dataOrInit, v, r, s } = tx;
  return rlp.encode([
    toBufferBE(nonce, 32),
    toBufferBE(gasPrice, 32),
    toBufferBE(gasLimit, 32),
    to ? to.toBuffer() : Buffer.of(),
    toBufferBE(value, 32),
    dataOrInit,
    new BN(v),
    new BN(r),
    new BN(s),
  ]);
}

export function deserializeTx(data: Buffer): Tx {
  const bufs: Buffer[] = rlp.decode(data) as any;
  return {
    nonce: toBigIntBE(bufs[0]),
    gasPrice: toBigIntBE(bufs[1]),
    gasLimit: toBigIntBE(bufs[2]),
    to: bufs[3].length ? new Address(bufs[3]) : undefined,
    value: toBigIntBE(bufs[4]),
    dataOrInit: bufs[5],
    v: '',
    r: '',
    s: '',
  };
}
