/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { Address } from 'web3x/address';
import { Tx } from '../tx';
import { WorldState } from '../world';
import { createBlockState } from './block-state';
import { Blockchain } from './blockchain';
import { evaluateTxs } from './evaluate-txs';

export async function mineTxs(worldState: WorldState, blockchain: Blockchain, txs: Tx[], sender: Address) {
  const blockchainContext = blockchain.getContext();

  const evaluatedTxs = await evaluateTxs(worldState, blockchainContext, txs, sender);

  const { coinbase, timestamp, difficulty, blockGasLimit, blockNumber, last256BlockHashes } = blockchainContext;
  const stateRoot = await worldState.getStateRoot();
  const parentHash = last256BlockHashes.length ? last256BlockHashes[last256BlockHashes.length - 1] : Buffer.of();

  const blockState = createBlockState(
    stateRoot,
    parentHash,
    blockNumber,
    coinbase,
    timestamp,
    difficulty,
    blockGasLimit,
    evaluatedTxs,
  );

  await blockchain.addBlock(blockState, evaluatedTxs);

  return { blockState, evaluatedTxs };
}
