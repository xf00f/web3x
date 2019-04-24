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

import Bytes from './bytes';
import Nat from './nat';
import elliptic from 'elliptic';
import { keccak256, keccak256s } from './hash';

const secp256k1 = new elliptic.ec('secp256k1');

export const create = (entropy: Buffer) => {
  const innerHex = keccak256(Bytes.concat(Bytes.random(32), '0x' + entropy.toString('hex') || Bytes.random(32)));
  const middleHex = Bytes.concat(Bytes.concat(Bytes.random(32), innerHex), Bytes.random(32));
  const outerHex = keccak256(middleHex);
  return fromPrivate(Buffer.from(outerHex.slice(2), 'hex'));
};

export const toChecksum = address => {
  const addressHash = keccak256s(address.slice(2));
  let checksumAddress = '0x';
  for (let i = 0; i < 40; i++)
    checksumAddress += parseInt(addressHash[i + 2], 16) > 7 ? address[i + 2].toUpperCase() : address[i + 2];
  return checksumAddress;
};

export const fromPrivate = (privateKey: Buffer) => {
  const ecKey = secp256k1.keyFromPrivate(privateKey);
  const publicKey = Buffer.from(ecKey.getPublic(false, 'hex'), 'hex');
  const publicHash = keccak256(publicKey.slice(1));
  const address = toChecksum('0x' + publicHash.slice(-40));
  return {
    address,
    privateKey,
    publicKey,
  };
};

export const encodeSignature = ([v, r, s]) => Bytes.flatten([Bytes.pad(32, r), Bytes.pad(32, s), v]);

export const decodeSignature = (hex: string) => [
  Bytes.slice(64, Bytes.length(hex), hex),
  Bytes.slice(0, 32, hex),
  Bytes.slice(32, 64, hex),
];

export const makeSigner = addToV => (hash, privateKey: Buffer) => {
  const signature = secp256k1.keyFromPrivate(privateKey).sign(Buffer.from(hash.slice(2), 'hex'), { canonical: true });
  return encodeSignature([
    Nat.fromString(Bytes.fromNumber(addToV + signature.recoveryParam)),
    Bytes.pad(32, Bytes.fromNat('0x' + signature.r.toString(16))),
    Bytes.pad(32, Bytes.fromNat('0x' + signature.s.toString(16))),
  ]);
};

export const sign = makeSigner(27); // v=27|28 instead of 0|1...

export const recover = (hash, signature) => {
  const vals = decodeSignature(signature);
  const vrs = { v: Bytes.toNumber(vals[0]), r: vals[1].slice(2), s: vals[2].slice(2) };
  const ecPublicKey = secp256k1.recoverPubKey(
    Buffer.from(hash.slice(2), 'hex'),
    vrs,
    vrs.v < 2 ? vrs.v : 1 - (vrs.v % 2),
  ); // because odd vals mean v=0... sadly that means v=0 means v=1... I hate that
  const publicKey = '0x' + ecPublicKey.encode('hex', false).slice(2);
  const publicHash = keccak256(publicKey);
  const address = toChecksum('0x' + publicHash.slice(-40));
  return address;
};

export default { create, toChecksum, fromPrivate, sign, makeSigner, recover, encodeSignature, decodeSignature };
