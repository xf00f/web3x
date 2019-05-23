import { Address } from 'web3x/address';
import { WorldState } from '../world/world-state';

export async function getAccountTransactions(worldState: WorldState, address: Address) {
  const account = await worldState.loadImmutableAccount(address);
  return account ? Number(account.nonce) : 0;
}
