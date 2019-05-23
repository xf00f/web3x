/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { toBigIntBE, toBufferBE } from 'bigint-buffer';
import * as rlp from 'rlp';
import { Address } from 'web3x/address';
import Account from 'web3x/eth-lib/account';
import Bytes from 'web3x/eth-lib/bytes';
import { bufferToHex, hexToBuffer, sha3 } from 'web3x/utils';

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
    hexToBuffer(v),
    hexToBuffer(r),
    hexToBuffer(s),
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
    v: bufferToHex(bufs[6]),
    r: bufferToHex(bufs[7]),
    s: bufferToHex(bufs[8]),
  };
}

const bigIntToHex = n => '0x' + n.toString(16);

export function recoverTransactionSender(tx: Tx): Address {
  const { to, nonce, gasPrice, gasLimit, value, dataOrInit, v, r, s } = tx;

  const signature = Bytes.flatten([Bytes.pad(32, r), Bytes.pad(32, s), v]);
  const recovery = Number(v);
  const extraData = recovery < 35 ? [] : [Bytes.fromNumber((recovery - 35) >> 1), '0x', '0x'];

  const signingData = [
    Bytes.fromNat(bigIntToHex(nonce)),
    Bytes.fromNat(bigIntToHex(gasPrice)),
    Bytes.fromNat(bigIntToHex(gasLimit)),
    to ? to.toString().toLowerCase() : '0x',
    Bytes.fromNat(bigIntToHex(value)),
    Bytes.fromNat(bufferToHex(dataOrInit)),
    ...extraData,
  ];

  const signingDataHex = rlp.encode(signingData);
  return Address.fromString(Account.recover(sha3(signingDataHex), signature));
}
