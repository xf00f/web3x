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

import bip39 from 'bip39';
import hdkey from 'hdkey';
import { Address } from '../address';
import { Eth } from '../eth';
import { create, fromPrivate } from '../eth-lib/account';
import { SendTx, SentTransaction } from '../eth/send-tx';
import { TransactionHash } from '../types';
import { decrypt, encrypt, KeyStore, randomBuffer } from '../utils';
import { sign } from '../utils/sign';
import { signTransaction, SignTransactionRequest } from './sign-transaction';

export interface AccountTx {
  nonce?: string | number;
  chainId?: string | number;
  to?: Address;
  data?: Buffer;
  value?: string | number;
  gas?: string | number;
  gasPrice?: string | number;
}

export class Account {
  constructor(readonly address: Address, readonly privateKey: Buffer, readonly publicKey: Buffer) {}

  public static create(entropy: Buffer = randomBuffer(32)) {
    const { privateKey, address, publicKey } = create(entropy);
    return new Account(Address.fromString(address), privateKey, publicKey);
  }

  public static fromPrivate(privateKey: Buffer) {
    const { address, publicKey } = fromPrivate(privateKey);
    return new Account(Address.fromString(address), privateKey, publicKey);
  }

  public static createFromMnemonicAndPath(mnemonic: string, derivationPath: string) {
    const seed = bip39.mnemonicToSeed(mnemonic);
    return Account.createFromSeedAndPath(seed, derivationPath);
  }

  public static createFromSeedAndPath(seed: Buffer, derivationPath: string) {
    const root = hdkey.fromMasterSeed(seed);
    const addrNode = root.derive(derivationPath);
    const privateKey = addrNode.privateKey;
    return Account.fromPrivate(privateKey);
  }

  public static async fromKeystore(v3Keystore: KeyStore | string, password: string, nonStrict = false) {
    return Account.fromPrivate(await decrypt(v3Keystore, password, nonStrict));
  }

  public sendTransaction(tx: AccountTx, eth: Eth): SendTx {
    const promise = new Promise<TransactionHash>(async (resolve, reject) => {
      try {
        const signedTx = await signTransaction(tx, this.privateKey, eth);
        resolve(await eth.sendSignedTransaction(signedTx.rawTransaction).getTxHash());
      } catch (err) {
        reject(err);
      }
    });
    return new SentTransaction(eth, promise);
  }

  public signTransaction(tx: AccountTx, eth: Eth) {
    return signTransaction(tx, this.privateKey, eth);
  }

  public sign(data: string) {
    return sign(data, this.privateKey);
  }

  public encrypt(password: string, options?: any) {
    return encrypt(this.privateKey, this.address, password, options);
  }
}
