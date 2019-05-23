/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { sign } from 'web3x/account/sign-transaction';
import { abiCoder } from 'web3x/contract/abi-coder';
import { TransactionRequest } from 'web3x/formatters';
import { TransactionHash } from 'web3x/types';
import { sha3 } from 'web3x/utils';
import { Wallet } from 'web3x/wallet';
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
