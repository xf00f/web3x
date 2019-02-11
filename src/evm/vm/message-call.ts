import { Address } from '../../address';
import { TxSubstrate } from '../tx';
import { WorldState } from '../world/world-state';
import { EvmContext } from './evm-context';

export async function messageCall(
  worldState: WorldState,
  sender: Address,
  origin: Address,
  recipient: Address,
  codeFrom: Address,
  value: bigint,
  gas: bigint,
  data: Buffer,
  callDepth: number,
  modify: boolean,
) {
  worldState.checkpoint();

  const senderAccount = (await worldState.loadAccount(sender))!;
  const recipientAccount = await worldState.loadOrCreateAccount(recipient);
  const codeAccount = (await worldState.loadAccount(codeFrom))!;
  const txSubstrate = new TxSubstrate();

  recipientAccount.balance += value;
  senderAccount.balance -= value;

  const callContext = new EvmContext(
    worldState,
    codeAccount.code,
    data,
    origin,
    sender,
    recipient,
    value,
    gas,
    recipientAccount.storage,
    callDepth,
    modify,
    txSubstrate,
  );
  await recipientAccount.run(callContext);

  if (callContext.reverted) {
    await worldState.revert();
  } else {
    await worldState.commit();
  }

  return {
    remainingGas: BigInt(0),
    txSubstrate,
    status: !callContext.reverted,
    returned: callContext.returned,
  };
}

export async function staticMessageCall(
  worldState: WorldState,
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
    codeAccount.code,
    data,
    origin,
    sender,
    recipient,
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
