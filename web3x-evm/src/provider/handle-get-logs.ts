/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { isArray } from 'util';
import { BlockType } from 'web3x/eth';
import { LogRequest, LogResponse } from 'web3x/formatters';
import { bufferToHex, hexToBuffer } from 'web3x/utils';
import { Blockchain, BlockHeader } from '../blockchain';

export async function getLogs(blockchain: Blockchain, logRequest: LogRequest) {
  const { toBlock, fromBlock, address, topics } = logRequest;

  const chainTip = await blockchain.getChaintip();
  const toBlockNum = toBlock !== undefined ? blockTypeToNumber(toBlock, chainTip) : chainTip.number;
  const fromBlockNum = fromBlock !== undefined ? blockTypeToNumber(fromBlock, chainTip) : chainTip.number;
  const addresses = address ? (isArray(address) ? address : [address]) : [];
  const result = await blockchain.getLogs(addresses, topicsToBuffers(topics!), fromBlockNum, toBlockNum);

  return result.map(
    ({ block, blockHash, transactionIndex, transactionHash, log: { address, data, topics } }) =>
      ({
        id: null,
        removed: false,
        logIndex: 0,
        blockNumber: block.number,
        blockHash: bufferToHex(blockHash),
        transactionHash: bufferToHex(transactionHash),
        transactionIndex,
        address,
        data: bufferToHex(data),
        topics: topics.map(bufferToHex),
      } as LogResponse),
  );
}

function blockTypeToNumber(block: BlockType, chainTip: BlockHeader) {
  switch (block) {
    case 'genesis':
      return 0;
    case 'latest':
      return chainTip.number;
    case 'pending':
      throw new Error('Pending block type not supported.');
    default:
      return block;
  }
}

function topicsToBuffers(topics: (string | string[] | null)[]) {
  return topics.map(topic => {
    if (topic === null) {
      return null;
    }
    topic = isArray(topic) ? topic : [topic];
    return topic.map(hexToBuffer);
  });
}
