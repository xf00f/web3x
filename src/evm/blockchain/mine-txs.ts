import { Address } from '../../address';
import { sha3Buffer } from '../../utils';
import { serializeTx, Tx, TxReceipt } from '../tx';
import { executeTransaction, ExTxContext, ExTxResult } from '../vm';
import { WorldState } from '../world';
import { Blockchain } from './blockchain';

export interface EvaluatedTx {
  tx: Tx;
  txHash: Buffer;
  receipt: TxReceipt;
  sender: Address;
  result: ExTxResult;
}

export async function mineTxs(worldState: WorldState, blockchain: Blockchain, gas: number, txs: Tx[], sender: Address) {
  const blockchainContext = blockchain.getContext();

  const evaluatedTxs = await Promise.all(
    txs.map(async tx => {
      const txHash = sha3Buffer(serializeTx(tx));

      const exTxContext: ExTxContext = {
        worldState,
        blockchainContext,
        sender,
      };

      const result = await executeTransaction(exTxContext, tx);

      const receipt: TxReceipt = {
        cumulativeGasUsed: BigInt(gas) - result.remainingGas,
        logs: result.txSubstrate ? result.txSubstrate.logs : [],
        logsBloomFilter: Buffer.of(),
        status: !result.reverted,
      };

      const evaluatedTx: EvaluatedTx = {
        tx,
        receipt,
        sender,
        txHash,
        result,
      };

      return evaluatedTx;
    }),
  );

  await blockchain.mineTransactions(await worldState.getStateRoot(), blockchainContext, evaluatedTxs);

  return evaluatedTxs;
}
