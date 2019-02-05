import { toBufferBE } from 'bigint-buffer';
import * as rlp from 'rlp';
import { Address } from '../../address';
import { TransactionReceipt } from '../../formatters';
import { TransactionHash } from '../../types';
import { bufferToHex, sha3Buffer } from '../../utils';
import { Blockchain } from '../blockchain';

export async function handleGetTransactionReceipt(
  blockchain: Blockchain,
  transactionHash: TransactionHash,
): Promise<TransactionReceipt> {
  // TODO: To be recovered from tx.
  const from = Address.fromString('0xd7b2c3559672e470dc637a56962378f3b81030d3');
  const txHash = Buffer.from(transactionHash.slice(2), 'hex');
  const { to, nonce } = await blockchain.getMinedTransaction(txHash);
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

  return {
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
}

function getContractAddress(from: Address, nonce: bigint) {
  return new Address(sha3Buffer(rlp.encode([from.toBuffer(), toBufferBE(nonce, 32)])).slice(12));
}
