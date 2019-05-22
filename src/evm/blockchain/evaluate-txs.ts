import { Address } from '../../address';
import { sha3Buffer } from '../../utils';
import { recoverTransactionSender, serializeTx, serializeTxReceipt, Tx, TxReceipt } from '../tx';
import { executeTransaction, ExTxContext, ExTxResult } from '../vm';
import { WorldState } from '../world';
import { BlockchainContext } from './blockchain';

export interface EvaluatedTx {
  tx: Tx;
  serializedTx: Buffer;
  txHash: Buffer;
  receipt: TxReceipt;
  serializedReceipt: Buffer;
  sender: Address;
  result: ExTxResult;
}

// If all tx's are from a known sender, you can provide the optional sender to save expensive recovery.
export async function evaluateTxs(
  worldState: WorldState,
  blockchainContext: BlockchainContext,
  txs: Tx[],
  sender?: Address,
) {
  let cumulativeGasUsed = BigInt(0);
  const evaluatedTxs: EvaluatedTx[] = [];

  for (const tx of txs) {
    const serializedTx = serializeTx(tx);
    const txHash = sha3Buffer(serializedTx);
    sender = sender || recoverTransactionSender(tx);

    const exTxContext: ExTxContext = {
      worldState,
      blockchainContext,
      sender,
    };

    const result = await executeTransaction(exTxContext, tx);

    cumulativeGasUsed += tx.gasLimit - result.remainingGas;

    const receipt: TxReceipt = {
      cumulativeGasUsed,
      logs: result.txSubstrate ? result.txSubstrate.logs : [],
      logsBloomFilter: Buffer.of(),
      status: !result.reverted,
    };

    const serializedReceipt = serializeTxReceipt(receipt);

    const evaluatedTx: EvaluatedTx = {
      tx,
      serializedTx,
      receipt,
      serializedReceipt,
      sender,
      txHash,
      result,
    };

    evaluatedTxs.push(evaluatedTx);
  }

  return evaluatedTxs;
}
