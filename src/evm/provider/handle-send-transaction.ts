import { TransactionRequest } from '../../formatters';
import { TransactionHash } from '../../types';
import { bufferToHex } from '../../utils';
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
    cumulativeGasUsed: BigInt(gas) - result.remainingGas,
    logs: result.txSubstrate.logs,
    logsBloomFilter: Buffer.of(),
    status: result.status,
  };

  const txHashes = await blockchain.mineTransactions(await worldState.getStateRoot(), [tx], [receipt]);

  return bufferToHex(txHashes[0]);
}
