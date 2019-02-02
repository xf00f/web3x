import { Address } from '../../address';
import { Tx, TxSubstrate } from '../tx';
import { WorldState } from '../world/world-state';
import { contractCreation } from './contract-creation';
import { Gas } from './gas';
import { messageCall } from './message-call';

interface ExTxResult {
  contractAddress?: Address;
  returned?: Buffer;
  remainingGas: bigint;
  txSubstrate: TxSubstrate;
  status: boolean;
}

export async function executeTransaction(worldState: WorldState, sender: Address, tx: Tx): Promise<ExTxResult> {
  const { to, dataOrInit, value, gasPrice, gasLimit } = tx;

  validateTx(worldState, sender, tx);

  worldState.checkpoint();
  const senderAccount = (await worldState.loadAccount(sender))!;
  senderAccount.nonce++;
  await worldState.commit();

  const result = to
    ? await messageCall(worldState, sender, sender, to, to, value, gasLimit, dataOrInit, 0, true)
    : await contractCreation(worldState, sender, sender, gasLimit, gasPrice, value, dataOrInit, 0, true);

  return result;
}

async function validateTx(worldState: WorldState, sender: Address, tx: Tx) {
  const { to, dataOrInit, value, nonce, gasLimit, gasPrice } = tx;

  // TODO: sender should be recovered from tx signature.
  const senderAccount = await worldState.loadImmutableAccount(sender);
  if (!senderAccount) {
    throw new Error('Sender account not found.');
  }

  if (senderAccount.nonce !== nonce) {
    throw new Error('Sender account nonce does not match transaction nonce.');
  }

  const intrinsicGas =
    (dataOrInit.length ? Gas.GTXDATANONZERO : Gas.GTXDATANONZERO) + (to ? 0 : Gas.GTXCREATE) + Gas.GTRANSACTION;
  if (gasLimit < intrinsicGas) {
    throw new Error(`Gas limit ${gasLimit} is less than intrinsic gas ${intrinsicGas} for this transaction.`);
  }

  const upFrontCost = gasLimit * gasPrice + value;
  if (senderAccount.balance < upFrontCost) {
    throw new Error('Sender account balance below cost of up front payment.');
  }

  // TODO: final condition YP-58.
}
