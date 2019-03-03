import { sign } from '../../account/sign-transaction';
import { TransactionRequest } from '../../formatters';
import { TransactionHash } from '../../types';
import { sha3 } from '../../utils';
import { Wallet } from '../../wallet';
import { Blockchain } from '../blockchain';
import { serializeTx, Tx, TxReceipt } from '../tx';
import { executeTransaction } from '../vm';
import { WorldState } from '../world';

export async function handleSendTransaction(
  worldState: WorldState,
  blockchain: Blockchain,
  txRequest: TransactionRequest,
  wallet: Wallet,
  blockDelay: number = 0,
): Promise<TransactionHash> {
  const { from, to, gas = 200000, gasPrice, value = 0, data } = txRequest;
  const nonce = txRequest.nonce ? BigInt(txRequest.nonce) : await worldState.getTransactionCount(from);

  const fromAccount = wallet.get(from);
  if (!fromAccount) {
    throw new Error(`Unknown address: ${from}`);
  }

  const signTxRequest = {
    chainId: 1,
    to,
    gas,
    gasPrice,
    value,
    data,
    nonce: nonce.toString(),
  };

  // TODO: Move sign function somewhere better (out of account module)?
  const { v, r, s } = sign(signTxRequest, fromAccount.privateKey);

  const tx: Tx = {
    nonce,
    to,
    dataOrInit: data!,
    gasPrice: BigInt(gasPrice),
    gasLimit: BigInt(gas),
    value: BigInt(value),
    v,
    r,
    s,
  };

  const txHash = sha3(serializeTx(tx));

  const mine = async () => {
    const result = await executeTransaction(worldState, tx, from);

    const receipt: TxReceipt = {
      cumulativeGasUsed: BigInt(gas) - result.remainingGas,
      logs: result.txSubstrate.logs,
      logsBloomFilter: Buffer.of(),
      status: result.status,
    };

    await blockchain.mineTransactions(await worldState.getStateRoot(), [tx], [receipt], [from]);
  };

  if (blockDelay) {
    setTimeout(mine, blockDelay);
  } else {
    await mine();
  }

  return txHash;
}
