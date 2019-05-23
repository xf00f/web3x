/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { Address } from 'web3x/address';
import { BlockchainContext } from '../blockchain';
import { TxSubstrate } from '../tx';
import { WorldState } from '../world';
import { EvmContext } from './evm-context';

export async function contractCreation(
  worldState: WorldState,
  blockchainCtx: BlockchainContext,
  sender: Address,
  origin: Address,
  gas: bigint,
  gasPrice: bigint,
  value: bigint,
  initCode: Buffer,
  callDepth: number,
  modify: boolean,
) {
  worldState.checkpoint();

  const senderAccount = await worldState.loadAccount(sender);
  if (!senderAccount) {
    throw new Error('Sender account not found.');
  }

  const contractAddress = senderAccount.nextContractAddress();
  const contractAccount = await worldState.createAccount(contractAddress, value, BigInt(1));

  const txSubstrate = new TxSubstrate();
  const callContext = new EvmContext(
    worldState,
    blockchainCtx,
    initCode,
    Buffer.of(),
    origin,
    sender,
    contractAddress,
    value,
    value,
    gas,
    gasPrice,
    contractAccount.storage,
    callDepth,
    modify,
    txSubstrate,
  );
  await contractAccount.run(callContext);

  if (callContext.reverted) {
    await worldState.revert();
  } else {
    const contractAccount = await worldState.loadAccount(contractAddress);
    contractAccount!.code = callContext.returned;
    await worldState.commit();
  }

  return {
    contractAddress,
    remainingGas: BigInt(0),
    txSubstrate,
    reverted: callContext.reverted,
    error: callContext.error,
  };
}
