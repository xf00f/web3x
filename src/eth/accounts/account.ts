import { Tx } from '../types';
import { create, fromPrivate } from '../../eth-lib/account';
import { randomHex, encrypt, KeyStore, decrypt } from '../../utils';
import { sign } from '../../utils/sign';
import { signTransaction } from './sign-transaction';
import { Eth } from '..';

export class Account {
  constructor(public address: string, public privateKey: string, public publicKey) {}

  static create(entropy: string = randomHex(32)) {
    const { privateKey, address, publicKey } = create(entropy);
    return new Account(address, privateKey, publicKey);
  }

  static fromPrivate(privateKey: string) {
    const { address, publicKey } = fromPrivate(privateKey);
    return new Account(address, privateKey, publicKey);
  }

  static async fromKeystore(v3Keystore: KeyStore | string, password: string, nonStrict = false) {
    return Account.fromPrivate(await decrypt(v3Keystore, password, nonStrict));
  }

  signTransaction(tx: Tx, eth: Eth) {
    return signTransaction(tx, this.privateKey, eth);
  }

  sign(data: string) {
    return sign(data, this.privateKey);
  }

  encrypt(password: string, options?: any) {
    return encrypt(this.privateKey, this.address, password, options);
  }
}
