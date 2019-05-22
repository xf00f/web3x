import { sign } from '../../account/sign-transaction';
import { abiCoder } from '../../contract/abi-coder';
import { TransactionRequest } from '../../formatters';
import { TransactionHash } from '../../types';
import { sha3 } from '../../utils';
import { Wallet } from '../../wallet';
import { Blockchain, serializeBlockState } from '../blockchain';
import { mineTxs } from '../blockchain/mine-txs';
import { serializeTx, Tx } from '../tx';
import { WorldState } from '../world';

export async function handleSendTransaction(
  worldState: WorldState,
  blockchain: Blockchain,
  txRequest: TransactionRequest,
  wallet: Wallet,
  broadcastChannel?: BroadcastChannel,
  blockDelay: number = 0,
): Promise<TransactionHash> {
  const { from: sender, to, gas = 200000, gasPrice, value = 0, data } = txRequest;
  const nonce = txRequest.nonce ? BigInt(txRequest.nonce) : await worldState.getTransactionCount(sender);

  const fromAccount = wallet.get(sender);
  if (!fromAccount) {
    throw new Error(`Unknown address: ${sender}`);
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
    const { evaluatedTxs, blockState } = await mineTxs(worldState, blockchain, [tx], sender);
    if (broadcastChannel) {
      broadcastChannel.postMessage(serializeBlockState(blockState));
    }
    return evaluatedTxs;
  };

  if (blockDelay) {
    setTimeout(mine, blockDelay);
  } else {
    const evaluatedTxs = await mine();
    const { result } = evaluatedTxs[0];
    if (result.reverted) {
      if (result.returned && result.returned.slice(0, 4).equals(Buffer.from('08c379a0', 'hex'))) {
        const errorMessage = abiCoder.decodeParameter('string', result.returned!.slice(4).toString('hex'));
        throw new Error(`Transaction failed: ${errorMessage}`);
      } else if (result.error) {
        throw result.error;
      }
    }
  }

  return txHash;
}
