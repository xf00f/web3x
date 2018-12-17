/*
  This file is part of web3x.

  web3x is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  web3x is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License
  along with web3x.  If not, see <http://www.gnu.org/licenses/>.
*/

import { numberToHex } from '../utils';
import RLP from '../eth-lib/rlp';
import Bytes from '../eth-lib/bytes';
import Hash from '../eth-lib/hash';
import Nat from '../eth-lib/nat';
import Account from '../eth-lib/account';
import { Eth, Tx } from '../eth';
import { inputCallFormatter } from '../formatters';

export interface SignedTx {
  messageHash: string;
  v: string;
  r: string;
  s: string;
  rawTransaction: string;
  chainId?: any;
  gasPrice?: any;
  nonce?: number;
}

export async function signTransaction(tx: Tx, privateKey: Buffer, eth: Eth): Promise<SignedTx> {
  if (!tx.gas) {
    throw new Error('gas is missing or 0');
  }

  // Resolve immediately if nonce, chainId and price are provided
  if (tx.nonce !== undefined && tx.chainId !== undefined && tx.gasPrice !== undefined) {
    return sign(tx, privateKey);
  }

  // Otherwise, get the missing info from the Ethereum Node
  const promises = [
    isNot(tx.chainId) ? eth.getId() : Promise.resolve(tx.chainId),
    isNot(tx.gasPrice) ? eth.getGasPrice() : Promise.resolve(tx.gasPrice),
    isNot(tx.nonce) ? eth.getTransactionCount(Account.fromPrivate(privateKey).address) : Promise.resolve(tx.nonce),
  ];

  const [chainId, gasPrice, nonce] = await Promise.all(promises);

  if (isNot(chainId) || isNot(gasPrice) || isNot(nonce)) {
    throw new Error('One of the values chainId, gasPrice, or nonce could not be fetched');
  }

  return sign({ ...tx, chainId, gasPrice, nonce }, privateKey);
}

export function recoverTransaction(rawTx: string): string {
  var values = RLP.decode(rawTx);
  var signature = Account.encodeSignature(values.slice(6, 9));
  var recovery = Bytes.toNumber(values[6]);
  var extraData = recovery < 35 ? [] : [Bytes.fromNumber((recovery - 35) >> 1), '0x', '0x'];
  var signingData = values.slice(0, 6).concat(extraData);
  var signingDataHex = RLP.encode(signingData);
  return Account.recover(Hash.keccak256(signingDataHex), signature);
}

function sign(tx: Tx, privateKey: Buffer): SignedTx {
  if (tx.nonce! < 0 || tx.gas < 0 || tx.gasPrice! < 0 || tx.chainId! < 0) {
    throw new Error('gas, gasPrice, nonce or chainId is lower than 0');
  }

  tx = inputCallFormatter(tx);

  const transaction = tx;
  transaction.to = tx.to || '0x';
  transaction.data = tx.data || '0x';
  transaction.value = tx.value || '0x';
  transaction.chainId = numberToHex(tx.chainId);

  const rlpEncoded = RLP.encode([
    Bytes.fromNat(transaction.nonce),
    Bytes.fromNat(transaction.gasPrice),
    Bytes.fromNat(transaction.gas),
    transaction.to.toLowerCase(),
    Bytes.fromNat(transaction.value),
    transaction.data,
    Bytes.fromNat(transaction.chainId || '0x1'),
    '0x',
    '0x',
  ]);

  const messageHash = Hash.keccak256(rlpEncoded);

  const signature = Account.makeSigner(Nat.toNumber(transaction.chainId || '0x1') * 2 + 35)(
    Hash.keccak256(rlpEncoded),
    privateKey,
  );

  const rawTx = RLP.decode(rlpEncoded)
    .slice(0, 6)
    .concat(Account.decodeSignature(signature));

  rawTx[6] = makeEven(trimLeadingZero(rawTx[6]));
  rawTx[7] = makeEven(trimLeadingZero(rawTx[7]));
  rawTx[8] = makeEven(trimLeadingZero(rawTx[8]));

  const rawTransaction = RLP.encode(rawTx);

  const values = RLP.decode(rawTransaction);

  return {
    messageHash,
    v: trimLeadingZero(values[6]),
    r: trimLeadingZero(values[7]),
    s: trimLeadingZero(values[8]),
    rawTransaction,
  };
}

function isNot(value) {
  return value === undefined || value === null;
}

function trimLeadingZero(hex) {
  while (hex && hex.startsWith('0x0')) {
    hex = '0x' + hex.slice(3);
  }
  return hex;
}

function makeEven(hex) {
  if (hex.length % 2 === 1) {
    hex = hex.replace('0x', '0x0');
  }
  return hex;
}
