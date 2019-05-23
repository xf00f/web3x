/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { Address } from 'web3x/address';
import { CallRequest } from 'web3x/formatters';
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
