import { LevelUp } from 'levelup';
import { Address } from '../../address';
import { Trie } from '../trie';
import { EvmAccount } from './evm-account';
import { EcAddAccount, EcdsaRecoveryAccount, EcMulAccount, EcPairingAccount } from './precompiled';

export function EvmAccountFactory(address: Address, nonce: bigint, balance: bigint, storage: Trie, code: Buffer) {
  switch (address.toString()) {
    case '0x0000000000000000000000000000000000000001':
      return new EcdsaRecoveryAccount(address, nonce, balance, storage, code);
    case '0x0000000000000000000000000000000000000006':
      return new EcAddAccount(address, nonce, balance, storage, code);
    case '0x0000000000000000000000000000000000000007':
      return new EcMulAccount(address, nonce, balance, storage, code);
    case '0x0000000000000000000000000000000000000008':
      return new EcPairingAccount(address, nonce, balance, storage, code);
    default:
      return new EvmAccount(address, nonce, balance, storage, code);
  }
}

export function createPrecompilesFromDb(db: LevelUp) {
  return [
    EcdsaRecoveryAccount.fromDb(db),
    EcAddAccount.fromDb(db),
    EcMulAccount.fromDb(db),
    EcPairingAccount.fromDb(db),
  ];
}
