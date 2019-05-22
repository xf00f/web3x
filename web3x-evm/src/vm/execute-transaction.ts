import { Address } from '../../address';
import { BlockchainContext } from '../blockchain';
import { recoverTransactionSender, Tx } from '../tx/tx';
import { TxSubstrate } from '../tx/tx-substrate';
import { WorldState } from '../world';
import { contractCreation } from './contract-creation';
import { Gas } from './gas';
import { messageCall } from './message-call';

export interface ExTxContext {
  worldState: WorldState;
  blockchainContext: BlockchainContext;
  sender?: Address;
}

export interface ExTxResult {
  contractAddress?: Address;
  returned?: Buffer;
  remainingGas: bigint;
  txSubstrate?: TxSubstrate;
  reverted: boolean;
  error?: Error;
}

export async function executeTransaction(context: ExTxContext, tx: Tx): Promise<ExTxResult> {
  const { to, dataOrInit, value, gasPrice, gasLimit } = tx;
  const { worldState, blockchainContext } = context;
  const sender = context.sender || recoverTransactionSender(tx);

  await validateTx(worldState, sender, tx);

  worldState.checkpoint();
  const senderAccount = (await worldState.loadAccount(sender))!;
  senderAccount.nonce++;
  await worldState.commit();

  const result = to
    ? await messageCall(
        worldState,
        blockchainContext,
        sender,
        sender,
        to,
        to,
        gasLimit,
        gasPrice,
        value,
        value,
        dataOrInit,
        0,
        true,
      )
    : await contractCreation(
        worldState,
        blockchainContext,
        sender,
        sender,
        gasLimit,
        gasPrice,
        value,
        dataOrInit,
        0,
        true,
      );

  return result;
}

async function validateTx(worldState: WorldState, sender: Address, tx: Tx) {
  const { to, dataOrInit, value, nonce, gasLimit, gasPrice } = tx;

  const senderAccount = await worldState.loadImmutableAccount(sender);
  if (!senderAccount) {
    throw new Error(`Sender account not found: ${sender}`);
  }

  if (senderAccount.nonce !== nonce) {
    throw new Error('Sender account nonce does not match transaction nonce.');
  }

  const intrinsicGas =
    (dataOrInit && dataOrInit.length ? Gas.GTXDATANONZERO : Gas.GTXDATANONZERO) +
    (to ? 0 : Gas.GTXCREATE) +
    Gas.GTRANSACTION;
  if (gasLimit < intrinsicGas) {
    throw new Error(`Gas limit ${gasLimit} is less than intrinsic gas ${intrinsicGas} for this transaction.`);
  }

  const upFrontCost = gasLimit * gasPrice + value;
  if (senderAccount.balance < upFrontCost) {
    throw new Error('Sender account balance below cost of up front payment.');
  }

  // TODO: final condition YP-58.
}
