import { Address } from '../../address';
import { WorldState } from '../world/world-state';

export async function getAccountCode(worldState: WorldState, address: Address) {
  const account = await worldState.loadImmutableAccount(address);
  return account ? account.code : Buffer.of();
}
