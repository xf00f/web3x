/*
  This file is part of web3x.

  web3x is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  web3x is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License
  along with web3x.  If not, see <http://www.gnu.org/licenses/>.
*/

import { Address } from '../address';
import { RawBlockHeaderResponse, RawBlockResponse, RawTransactionResponse } from '../formatters';
import { MockEthereumProvider } from '../providers/mock-ethereum-provider';
import { hexToBuffer, numberToHex } from '../utils';
import { Eth } from './eth';

describe('eth', () => {
  const from = Address.fromString('0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe');
  const contractAddress = Address.fromString('0x1234567890123456789012345678901234567891');
  const basicTx = {
    from,
    to: Address.fromString('0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe'),
    data: hexToBuffer('0x0a123456'),
    gasPrice: 100,
    gas: 100,
  };
  const blockHeader: RawBlockHeaderResponse = {
    hash: '0xd6960376d6c6dea93647383ffb245cfced97ccc5c7525397a543a72fdaea5265',
    parentHash: '0x83ffb245cfced97ccc5c75253d6960376d6c6dea93647397a543a72fdaea5265',
    miner: '0xdcc6960376d6c6dea93647383ffb245cfced97cf',
    stateRoot: '0x54dda68af07643f68739a6e9612ad157a26ae7e2ce81f77842bb5835fbcde583',
    transactionsRoot: '0x64dda68af07643f68739a6e9612ad157a26ae7e2ce81f77842bb5835fbcde583',
    receiptsRoot: '0x74dda68af07643f68739a6e9612ad157a26ae7e2ce81f77842bb5835fbcde583',
    sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
    logsBloom: '0xd6960376d6c6dea93647383ffb245cfced97ccc5c7525397a543a72fdaea5265',
    difficulty: '0x3e8',
    number: '0x11',
    gasLimit: '0x3e8',
    gasUsed: '0x3e8',
    timestamp: '0x3e8',
    extraData: '0xd6960376d6c6dea93647383ffb245cfced97ccc5c7525397a543a72fdaea5265',
    nonce: '0xd6960376d6c6dea93647383ffb245cfced97ccc5c7525397a543a72fdaea5265',
  };
  const tx: RawTransactionResponse = {
    input: '0x3454645634534',
    from: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
    to: '0x11f4d0a3c12e86b4b5f39b213f7e19d048276dae',
    value: '0x3e8',
    gas: '0x3e8',
    gasPrice: '0x3e8',
    nonce: '0xb',
    transactionIndex: '0x1',
    blockNumber: '0x10',
    blockHash: '0xc9b9cdc2092a9d6589d96662b1fd6949611163fb3910cf8a173cd060f17702f9',
    hash: '0xd9b9cdc2092a9d6589d96662b1fd6949611163fb3910cf8a173cd060f17702f9',
    v: 'v',
    r: 'r',
    s: 's',
  };
  const block: RawBlockResponse = {
    ...blockHeader,
    totalDifficulty: '0x3e8',
    size: '0x3e8',
    transactions: [],
    uncles: [],
  };
  let mockEthereumProvider: MockEthereumProvider;

  beforeEach(() => {
    mockEthereumProvider = new MockEthereumProvider();
  });

  it('should successfully make call and return response', async () => {
    const eth = new Eth(mockEthereumProvider);

    mockEthereumProvider.send.mockResolvedValue('0x1234567453543456321456321');

    const result = await eth.call(basicTx);

    expect(result).toEqual('0x1234567453543456321456321');
  });

  it('should fail call due to provider returning error', async () => {
    const eth = new Eth(mockEthereumProvider);

    mockEthereumProvider.send.mockRejectedValue({
      message: 'Wrong!',
      code: 1234,
    });

    await expect(eth.call(basicTx)).rejects.toEqual({
      message: 'Wrong!',
      code: 1234,
    });
  });

  it('should send transaction and fill in gasPrice if not given', async () => {
    const eth = new Eth(mockEthereumProvider);

    // eth_gasPrice
    mockEthereumProvider.send.mockResolvedValueOnce('0xffffdddd');
    // eth_sendTransaction
    mockEthereumProvider.send.mockResolvedValueOnce('0x1234567453543456321456321');
    // eth_getTransactionReceipt
    mockEthereumProvider.send.mockResolvedValueOnce({ blockHash: '0x1234' });

    const { gasPrice, ...gasPricelessTx } = basicTx;
    await eth.sendTransaction(gasPricelessTx).getTxHash();

    expect(mockEthereumProvider.send.mock.calls[0][0]).toBe('eth_gasPrice');

    expect(mockEthereumProvider.send.mock.calls[1]).toEqual([
      'eth_sendTransaction',
      [
        {
          from: '0x11f4d0a3c12e86b4b5f39b213f7e19d048276dae',
          to: '0x11f4d0a3c12e86b4b5f39b213f7e19d048276dae',
          data: '0x0a123456',
          gas: '0x64',
          gasPrice: '0xffffdddd',
        },
      ],
    ]);
  });

  it('should send transaction, subscribe, wait for block and get receipt', async () => {
    mockEthereumProvider.send.mockImplementationOnce(async method => {
      expect(method).toBe('eth_sendTransaction');
      return '0x1234567453543456321456321';
    });

    mockEthereumProvider.send.mockImplementationOnce(async method => {
      expect(method).toBe('eth_getTransactionReceipt');
      return null;
    });

    mockEthereumProvider.send.mockImplementationOnce(async method => {
      expect(method).toBe('eth_subscribe');

      setTimeout(() => {
        mockEthereumProvider.emit('notification', {
          subscription: '0x1234567',
          result: blockHeader,
        });
      }, 100);

      return '0x1234567';
    });

    mockEthereumProvider.send.mockImplementationOnce(async method => {
      expect(method).toBe('eth_getTransactionReceipt');
      return {
        from: from.toString(),
        contractAddress: contractAddress.toString(),
        cumulativeGasUsed: '0xa',
        transactionIndex: '0x3',
        blockNumber: '0xa',
        blockHash: '0xafff',
        gasUsed: '0x0',
      };
    });

    const eth = new Eth(mockEthereumProvider);

    const result = await eth.sendTransaction(basicTx).getReceipt();

    expect(result).toEqual({
      from,
      contractAddress,
      cumulativeGasUsed: 10,
      transactionIndex: 3,
      blockNumber: 10,
      blockHash: '0xafff',
      gasUsed: 0,
    });
  });

  it('should send transaction and fail after no receipt after 50 blocks', async () => {
    mockEthereumProvider.send.mockImplementationOnce(async method => {
      expect(method).toBe('eth_sendTransaction');
      return '0x1234567453543456321456321';
    });

    mockEthereumProvider.send.mockImplementationOnce(async method => {
      expect(method).toBe('eth_getTransactionReceipt');
      return null;
    });

    mockEthereumProvider.send.mockImplementationOnce(async method => {
      expect(method).toBe('eth_subscribe');

      // Fire 50 fake newBlocks
      for (let i = 0; i < 51; i++) {
        setTimeout(() => {
          mockEthereumProvider.emit('notification', {
            subscription: '0x1234567',
            result: blockHeader,
          });
        }, i * 10);
      }

      return '0x1234567';
    });

    const eth = new Eth(mockEthereumProvider);

    await expect(eth.sendTransaction(basicTx).getReceipt()).rejects.toBeInstanceOf(Error);
  });

  it('should send transaction, subscribe, and receive emitted confirmation receipts', async () => {
    mockEthereumProvider.send.mockImplementationOnce(async method => {
      expect(method).toBe('eth_sendTransaction');
      return '0x1234567453543456321456321';
    });

    mockEthereumProvider.send.mockImplementationOnce(async method => {
      expect(method).toBe('eth_getTransactionReceipt');
      return null;
    });

    mockEthereumProvider.send.mockImplementationOnce(async method => {
      expect(method).toBe('eth_subscribe');

      // Fire 10 fake newBlocks
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          mockEthereumProvider.emit('notification', {
            subscription: '0x1234567',
            result: {
              ...blockHeader,
              number: numberToHex(16 + i),
            },
          });
        }, i * 10);
      }

      return '0x1234567';
    });

    mockEthereumProvider.send.mockImplementation(async () => {
      return {
        from: from.toString(),
        contractAddress: null,
        cumulativeGasUsed: '0xa',
        transactionIndex: '0x3',
        blockNumber: '0x10',
        blockHash: '0xafff',
        gasUsed: '0x0',
      };
    });

    const eth = new Eth(mockEthereumProvider);

    let confCount = 0;

    const sendTx = eth.sendTransaction(basicTx);
    expect(await sendTx.getTxHash()).toBe('0x1234567453543456321456321');

    await sendTx.getReceipt(10, (conf, receipt) => {
      expect(receipt).toEqual({
        from,
        cumulativeGasUsed: 10,
        transactionIndex: 3,
        blockNumber: 16,
        blockHash: '0xafff',
        gasUsed: 0,
      });

      confCount++;

      expect(conf).toBe(confCount);
    });

    expect(confCount).toBe(10);
  });

  it('should get block with transaction hash in response', async () => {
    const testBlock = {
      ...block,
      transactions: ['0xd9b9cdc2092a9d6589d96662b1fd6949611163fb3910cf8a173cd060f17702f9'],
    };

    mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
      expect(method).toBe('eth_getBlockByNumber');
      expect(params).toEqual(['0x0', false]);
      return testBlock;
    });

    const eth = new Eth(mockEthereumProvider);
    const resultBlock = await eth.getBlock(0);

    expect(resultBlock.transactions[0]).toEqual(hexToBuffer(testBlock.transactions[0]));
  });

  it('should get block with transaction response in response', async () => {
    const testBlock = {
      ...block,
      transactions: [tx],
    };

    mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
      expect(method).toBe('eth_getBlockByNumber');
      expect(params).toEqual(['0x0', true]);
      return testBlock;
    });

    const eth = new Eth(mockEthereumProvider);
    const resultBlock = await eth.getBlock(0, true);

    expect(resultBlock.transactions[0].blockNumber).toBe(16);
  });
});
