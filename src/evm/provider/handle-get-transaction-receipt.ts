import { toBufferBE } from 'bigint-buffer';
import * as rlp from 'rlp';
import { Address } from '../../address';
import { TransactionReceipt } from '../../formatters';
import { TransactionHash } from '../../types';
import { bufferToHex, hexToBuffer, sha3Buffer } from '../../utils';
import { Blockchain } from '../blockchain';
import { recoverTransaction } from '../tx';

export async function handleGetTransactionReceipt(
  blockchain: Blockchain,
  transactionHash: TransactionHash,
): Promise<TransactionReceipt> {
  const txHash = hexToBuffer(transactionHash);
  const tx = await blockchain.getMinedTransaction(txHash);
  const { to, nonce } = tx;
  // TODO: Store from in tx so no need to recover? This is slow.
  const from = recoverTransaction(tx);
  const { cumulativeGasUsed, logs, status } = await blockchain.getTransactionReceipt(txHash);

  const receiptLogs = logs.map((log, logIndex) => ({
    id: null,
    removed: false,
    logIndex,
    blockNumber: 0,
    blockHash: '0',
    transactionHash,
    transactionIndex: 0,
    address: log.address,
    data: bufferToHex(log.data),
    topics: log.topics.map(bufferToHex),
  }));

  const txReceipt = {
    transactionHash,
    transactionIndex: 0,
    blockHash: '0',
    blockNumber: 0,
    from,
    to,
    cumulativeGasUsed: Number(cumulativeGasUsed),
    gasUsed: Number(cumulativeGasUsed),
    contractAddress: !to ? getContractAddress(from, nonce) : undefined,
    logs: receiptLogs,
    status,
  };

  return txReceipt;
}

function getContractAddress(from: Address, nonce: bigint) {
  return new Address(sha3Buffer(rlp.encode([from.toBuffer(), toBufferBE(nonce, 32)])).slice(12));
}
