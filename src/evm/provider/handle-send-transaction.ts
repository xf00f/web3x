import { TransactionRequest } from '../../formatters';
import { TransactionHash } from '../../types';
import { randomHex } from '../../utils';
import { Blockchain } from '../blockchain';
import { Tx, TxReceipt } from '../tx';
import { executeTransaction } from '../vm';
import { WorldState } from '../world/world-state';

export async function handleSendTransaction(
  worldState: WorldState,
  blockchain: Blockchain,
  txRequest: TransactionRequest,
): Promise<TransactionHash> {
  const { from, to, gas = 200000, gasPrice, value = 0, data, nonce } = txRequest;

  // TODO: Generate from tx.
  const transactionHash = randomHex(32);

  const tx: Tx = {
    nonce: nonce ? BigInt(nonce) : await worldState.getTransactionCount(from),
    to,
    dataOrInit: data!,
    gasPrice: BigInt(gasPrice),
    gasLimit: BigInt(gas),
    value: BigInt(value),
    v: '',
    r: '',
    s: '',
  };

  const result = await executeTransaction(worldState, from, tx);

  const receipt: TxReceipt = {
    from,
    to,
    cumulativeGasUsed: BigInt(gas) - result.remainingGas,
    gasUsed: BigInt(gas) - result.remainingGas,
    contractAddress: result.contractAddress,
    logs: result.txSubstrate.logs,
    status: result.status,
  };

  blockchain.receipts[transactionHash] = receipt;

  return transactionHash;
}
