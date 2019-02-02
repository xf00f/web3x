import { TransactionReceipt } from '../../formatters';
import { TransactionHash } from '../../types';
import { bufferToHex } from '../../utils';
import { Blockchain } from '../blockchain';

export async function handleGetTransactionReceipt(
  blockchain: Blockchain,
  transactionHash: TransactionHash,
): Promise<TransactionReceipt> {
  const { from, to, cumulativeGasUsed, gasUsed, contractAddress, logs, status } = blockchain.receipts[transactionHash];

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
    gasUsed: Number(gasUsed),
    contractAddress,
    logs: receiptLogs,
    status,
  };
}
