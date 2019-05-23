import { RawTransactionResponse, toRawTransactionResponse, TransactionResponse } from 'web3x/formatters';
import { TransactionHash } from 'web3x/types';
import { bufferToHex, hexToBuffer } from 'web3x/utils';
import { Blockchain } from '../blockchain';

export async function handleGetTransactionByHash(
  blockchain: Blockchain,
  transactionHash: TransactionHash,
): Promise<RawTransactionResponse | null> {
  const txHash = hexToBuffer(transactionHash);
  const txDetails = await blockchain.getMinedTransaction(txHash);

  if (!txDetails) {
    return null;
  }

  const { blockHeader, tx, txIndex, blockHash, from } = txDetails;

  const txResponse: TransactionResponse = {
    blockHash: bufferToHex(blockHash),
    blockNumber: blockHeader.number,
    from,
    gas: Number(tx.gasLimit),
    gasPrice: tx.gasPrice.toString(),
    hash: transactionHash,
    input: bufferToHex(tx.dataOrInit),
    nonce: Number(tx.nonce),
    to: tx.to || null,
    transactionIndex: txIndex,
    value: tx.value.toString(),
    v: tx.v,
    r: tx.r,
    s: tx.s,
  };

  return toRawTransactionResponse(txResponse);
}
