import { Address } from '../../address';
import { CallRequest } from '../../formatters';
import { Blockchain } from '../blockchain';
import { staticMessageCall } from '../vm';
import { WorldState } from '../world/world-state';

export async function handleCall(worldState: WorldState, blockchain: Blockchain, callRequest: CallRequest) {
  const { to, data, from = Address.ZERO } = callRequest;

  if (data) {
    const { returned } = await staticMessageCall(worldState, blockchain.getContext(), from, from, to, to, data, 0);
    return returned;
  }

  return Buffer.of();
}
