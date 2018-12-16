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

import { Eth } from './eth';
import { MockEthereumProvider } from '../providers/mock-ethereum-provider';

describe('eth', () => {
  const contractAddress = '0x1234567890123456789012345678901234567891';
  const basicTx = {
    from: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
    to: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
    data: '0xa123456',
    gasPrice: 100,
    gas: 100,
  };
  const deployTx = {
    from: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
    data: '0xa123456',
    gasPrice: 100,
    gas: 100,
  };
  let mockEthereumProvider: MockEthereumProvider;

  beforeEach(() => {
    mockEthereumProvider = new MockEthereumProvider();
  });

  it('should return a promise and resolve it', async () => {
    const eth = new Eth(mockEthereumProvider);

    mockEthereumProvider.send.mockResolvedValue('0x1234567453543456321456321');

    const result = await eth.call(basicTx);

    expect(result).toEqual('0x1234567453543456321456321');
  });

  it('should return a promise and fail it', async () => {
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

  it('should return an error, if the outputFormatter throws an error', async () => {
    const eth = new Eth(mockEthereumProvider);

    mockEthereumProvider.send.mockResolvedValue('0x1234567453543456321456321');

    await expect(
      eth.call(basicTx, undefined, _ => {
        throw new Error('Error!');
      }),
    ).rejects.toBeInstanceOf(Error);
  });

  it('should fill in gasPrice if not given', async () => {
    const eth = new Eth(mockEthereumProvider);

    // eth_gasPrice
    mockEthereumProvider.send.mockResolvedValueOnce('0xffffdddd');
    // eth_sendTransaction
    mockEthereumProvider.send.mockResolvedValueOnce('0x1234567453543456321456321');
    // eth_getTransactionReceipt
    mockEthereumProvider.send.mockResolvedValueOnce({ blockHash: '0x1234' });

    const { gasPrice, ...gasPricelessTx } = basicTx;
    await eth.sendTransaction(gasPricelessTx);

    expect(mockEthereumProvider.send.mock.calls[0][0]).toBe('eth_gasPrice');

    expect(mockEthereumProvider.send.mock.calls[1]).toEqual([
      'eth_sendTransaction',
      [
        {
          from: '0x11f4d0a3c12e86b4b5f39b213f7e19d048276dae',
          to: '0x11f4d0a3c12e86b4b5f39b213f7e19d048276dae',
          data: '0xa123456',
          gas: '0x64',
          gasPrice: '0xffffdddd',
        },
      ],
    ]);
  });

  it('should fail to send transaction when from not specified', async () => {
    const eth = new Eth(mockEthereumProvider);
    const { from, ...fromlessTx } = basicTx;
    await expect(eth.sendTransaction(fromlessTx)).rejects.toThrowError('"from" field must be defined');
  });

  const bootstrap1 = function(address: string | null = contractAddress) {
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

      setTimeout(function() {
        mockEthereumProvider.emit('notification', {
          subscription: '0x1234567',
          result: {
            blockNumber: '0x10',
          },
        });
      }, 100);

      return '0x1234567';
    });

    mockEthereumProvider.send.mockImplementationOnce(async method => {
      expect(method).toBe('eth_getTransactionReceipt');
      return {
        contractAddress: address,
        cumulativeGasUsed: '0xa',
        transactionIndex: '0x3',
        blockNumber: '0xa',
        blockHash: '0xafff',
        gasUsed: '0x0',
      };
    });

    return new Eth(mockEthereumProvider);
  };

  it('should use promise when subscribing and checking for receipt', async () => {
    const eth = bootstrap1();

    const result = await eth.sendTransaction(basicTx);

    expect(result).toEqual({
      contractAddress,
      cumulativeGasUsed: 10,
      transactionIndex: 3,
      blockNumber: 10,
      blockHash: '0xafff',
      gasUsed: 0,
    });
  });

  it('should use emitter when subscribing and checking for receipt', done => {
    const eth = bootstrap1();

    eth.sendTransaction(basicTx).on('receipt', function(result) {
      expect(result).toEqual({
        contractAddress,
        cumulativeGasUsed: 10,
        transactionIndex: 3,
        blockNumber: 10,
        blockHash: '0xafff',
        gasUsed: 0,
      });

      done();
    });
  });

  it('should use promise when subscribing and checking for deployed contract', async () => {
    const eth = bootstrap1();

    mockEthereumProvider.send.mockImplementationOnce(async method => {
      expect(method).toBe('eth_getCode');
      return '0x321';
    });

    const result = await eth.sendTransaction(deployTx);

    expect(result).toEqual({
      contractAddress,
      cumulativeGasUsed: 10,
      transactionIndex: 3,
      blockNumber: 10,
      blockHash: '0xafff',
      gasUsed: 0,
    });
  });

  it('should use emitter when subscribing and checking deployed contract', done => {
    const eth = bootstrap1();

    mockEthereumProvider.send.mockImplementationOnce(async method => {
      expect(method).toBe('eth_getCode');
      return '0x321';
    });

    eth
      .sendTransaction(deployTx)
      .on('receipt', function(result) {
        expect(result).toEqual({
          contractAddress,
          cumulativeGasUsed: 10,
          transactionIndex: 3,
          blockNumber: 10,
          blockHash: '0xafff',
          gasUsed: 0,
        });

        done();
      })
      .catch(done);
  });

  it('should fail with promise when deploying contract (empty code)', async () => {
    const eth = bootstrap1();

    mockEthereumProvider.send.mockImplementationOnce(async method => {
      expect(method).toBe('eth_getCode');
      return '0x';
    });

    await expect(eth.sendTransaction(deployTx)).rejects.toBeInstanceOf(Error);
  });

  it('should fail with emitter when deploying contract (empty code)', done => {
    const eth = bootstrap1();

    mockEthereumProvider.send.mockImplementationOnce(async method => {
      expect(method).toBe('eth_getCode');
      return '0x';
    });

    eth.sendTransaction(deployTx).on('error', function(error) {
      expect(error).toBeInstanceOf(Error);
      done();
    });
  });

  it('should fail with promise when deploying contract (no address)', async () => {
    const eth = bootstrap1(null);

    await expect(eth.sendTransaction(deployTx)).rejects.toBeInstanceOf(Error);
  });

  it('should fail with emitter when deploying contract (no address)', done => {
    const eth = bootstrap1(null);

    eth
      .sendTransaction(deployTx)
      .on('error', function(error) {
        expect(error).toBeInstanceOf(Error);
      })
      .catch(function(error) {
        expect(error).toBeInstanceOf(Error);
        done();
      });
  });

  const failOnTimeout = function() {
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
        setTimeout(function() {
          mockEthereumProvider.emit('notification', {
            subscription: '0x1234567',
            result: {
              blockNumber: '0x10',
            },
          });
        }, i * 10);
      }

      return '0x1234567';
    });

    return new Eth(mockEthereumProvider);
  };

  it('should fail with promise after no receipt after 50 blocks', async () => {
    const eth = failOnTimeout();

    await expect(eth.sendTransaction(basicTx)).rejects.toBeInstanceOf(Error);
  });

  it('should fail with emitter after no receipt after 50 blocks', done => {
    const eth = failOnTimeout();

    eth.sendTransaction(basicTx).on('error', function(error) {
      expect(error).toBeInstanceOf(Error);
      done();
    });
  });

  it('should receive emitted confirmation receipts', function(done) {
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
        setTimeout(function() {
          mockEthereumProvider.emit('notification', {
            subscription: '0x1234567',
            result: {
              blockNumber: '0x10',
            },
          });
        }, i * 10);
      }

      return '0x1234567';
    });

    mockEthereumProvider.send.mockImplementation(async () => {
      return {
        contractAddress: null,
        cumulativeGasUsed: '0xa',
        transactionIndex: '0x3',
        blockNumber: '0xa',
        blockHash: '0xafff',
        gasUsed: '0x0',
      };
    });

    const eth = new Eth(mockEthereumProvider);

    let countConf = 0;

    eth
      .sendTransaction(basicTx)
      .on('transactionHash', result => {
        expect(result).toBe('0x1234567453543456321456321');
      })
      .on('receipt', result => {
        expect(result).toEqual({
          contractAddress: null,
          cumulativeGasUsed: 10,
          transactionIndex: 3,
          blockNumber: 10,
          blockHash: '0xafff',
          gasUsed: 0,
        });
      })
      .on('confirmation', (conf, receipt) => {
        expect(receipt).toEqual({
          contractAddress: null,
          cumulativeGasUsed: 10,
          transactionIndex: 3,
          blockNumber: 10,
          blockHash: '0xafff',
          gasUsed: 0,
        });

        expect(conf).toBe(countConf);

        countConf++;

        if (conf === 9) {
          done();
        }
      });
  });
});
