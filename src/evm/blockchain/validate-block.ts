import { Address } from '../../address';
import { Tx, TxReceipt } from '../tx';
import { ExTxResult } from '../vm';
import { WorldState } from '../world';
import { BlockState } from './block-state';
import { Blockchain } from './blockchain';
import { evaluateTxs } from './evaluate-txs';

export interface EvaluatedTx {
  tx: Tx;
  txHash: Buffer;
  receipt: TxReceipt;
  sender: Address;
  result: ExTxResult;
}

export async function validateBlock(worldState: WorldState, blockchain: Blockchain, blockState: BlockState) {
  const {
    transactions: txs,
    header: { stateRoot },
  } = blockState;
  const blockchainContext = blockchain.getContext();

  const evaluatedTxs = await evaluateTxs(worldState, blockchainContext, txs);

  const newStateRoot = worldState.getStateRoot();

  // TODO: Probably rollback on bad state.
  if (!newStateRoot.equals(stateRoot)) {
    throw new Error('Invalid state root.');
  }

  await blockchain.addBlock(blockState, evaluatedTxs);

  return evaluatedTxs;
}
