import { Address } from '../../address';
import { BlockchainContext } from '../blockchain';
import { TxSubstrate } from '../tx';
import { WorldState } from '../world/world-state';
import { EvmContext } from './evm-context';

export async function messageCall(
  worldState: WorldState,
  blockchainCtx: BlockchainContext,
  sender: Address,
  origin: Address,
  recipient: Address,
  codeFrom: Address,
  availableGas: bigint,
  gasPrice: bigint,
  transferValue: bigint,
  executionValue: bigint,
  data: Buffer,
  callDepth: number,
  modify: boolean,
) {
  worldState.checkpoint();

  const senderAccount = (await worldState.loadAccount(sender))!;
  const recipientAccount = await worldState.loadOrCreateAccount(recipient);
  const codeAccount = (await worldState.loadAccount(codeFrom))!;
  const txSubstrate = new TxSubstrate();

  recipientAccount.balance += transferValue;
  senderAccount.balance -= transferValue;

  const callContext = new EvmContext(
    worldState,
    blockchainCtx,
    codeAccount.code,
    data,
    origin,
    sender,
    recipient,
    transferValue,
    executionValue,
    availableGas,
    gasPrice,
    recipientAccount.storage,
    callDepth,
    modify,
    txSubstrate,
  );
  await recipientAccount.run(callContext);

  const { reverted, returned, error } = callContext;

  if (reverted) {
    await worldState.revert();
    return {
      remainingGas: BigInt(0),
      reverted,
      returned,
    };
  }

  await worldState.commit();

  return {
    remainingGas: BigInt(0),
    txSubstrate,
    reverted,
    returned,
    error,
  };
}

export async function staticMessageCall(
  worldState: WorldState,
  blockchainCtx: BlockchainContext,
  sender: Address,
  origin: Address,
  recipient: Address,
  codeFrom: Address,
  data: Buffer,
  callDepth: number,
) {
  const codeAccount = (await worldState.loadImmutableAccount(codeFrom))!;
  const recipientAccount = (await worldState.loadImmutableAccount(recipient))!;

  const callContext = new EvmContext(
    worldState,
    blockchainCtx,
    codeAccount.code,
    data,
    origin,
    sender,
    recipient,
    BigInt(0),
    BigInt(0),
    BigInt(0),
    BigInt(0),
    recipientAccount.storage,
    callDepth,
    false,
  );
  await recipientAccount.run(callContext);

  return {
    returned: callContext.returned,
  };
}
