import {
  inputDefaultBlockNumberFormatter,
  inputCallFormatter,
  inputTransactionFormatter,
} from '../core-helpers/formatters';
import { MockRequestManager } from '../core-request-manager/mock-request-manager';
import { Eth } from './eth';

describe('eth', () => {
  const contractAddress = '0x1234567890123456789012345678901234567891';
  let mockRequestManager: MockRequestManager;

  beforeEach(() => {
    mockRequestManager = new MockRequestManager();
  });

  it('should return a promise and resolve it', async () => {
    const eth = new Eth(mockRequestManager);

    mockRequestManager.send.mockResolvedValue('0x1234567453543456321456321');

    const result = await eth.call({
      from: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
      to: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
      data: '0xa123456',
    });

    expect(result).toEqual('0x1234567453543456321456321');
  });

  it('should return a promise and fail it', async () => {
    const eth = new Eth(mockRequestManager);

    mockRequestManager.send.mockRejectedValue({
      message: 'Wrong!',
      code: 1234,
    });

    await expect(
      eth.call({
        from: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
        to: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
        data: '0xa123456',
      }),
    ).rejects.toEqual({
      message: 'Wrong!',
      code: 1234,
    });
  });

  it('should return an error, if the outputFormatter throws an error', async () => {
    const eth = new Eth(mockRequestManager);

    mockRequestManager.send.mockResolvedValue('0x1234567453543456321456321');

    await expect(
      eth.call(
        {
          from: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
          to: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
          data: '0xa123456',
        },
        undefined,
        _ => {
          throw new Error('Error!');
        },
      ),
    ).rejects.toBeInstanceOf(Error);
  });

  it('should fill in gasPrice if not given', async () => {
    const eth = new Eth(mockRequestManager);

    // eth_gasPrice
    mockRequestManager.send.mockResolvedValueOnce('0xffffdddd');
    // eth_sendTransaction
    mockRequestManager.send.mockResolvedValueOnce('0x1234567453543456321456321');
    // eth_getTransactionReceipt
    mockRequestManager.send.mockResolvedValueOnce({ blockHash: '0x1234' });

    await eth.sendTransaction({
      from: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
      to: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
      data: '0xa123456',
    });

    expect(mockRequestManager.send.mock.calls[0][0]).toMatchObject({
      method: 'eth_gasPrice',
    });

    expect(mockRequestManager.send.mock.calls[1][0]).toMatchObject({
      method: 'eth_sendTransaction',
      params: [
        {
          from: '0x11f4d0a3c12e86b4b5f39b213f7e19d048276dae',
          to: '0x11f4d0a3c12e86b4b5f39b213f7e19d048276dae',
          data: '0xa123456',
          gasPrice: '0xffffdddd',
        },
      ],
    });
  });

  const bootstrap1 = function(address: string | null = contractAddress) {
    mockRequestManager.send.mockImplementationOnce(async payload => {
      expect(payload.method).toBe('eth_sendTransaction');
      return '0x1234567453543456321456321';
    });

    mockRequestManager.send.mockImplementationOnce(async payload => {
      expect(payload.method).toBe('eth_getTransactionReceipt');
      return null;
    });

    mockRequestManager.send.mockImplementationOnce(async payload => {
      expect(payload.method).toBe('eth_subscribe');

      setTimeout(function() {
        mockRequestManager.provider.emit('0x1234567', null, {
          method: 'eth_subscription',
          params: {
            subscription: '0x1234567',
            result: {
              blockNumber: '0x10',
            },
          },
        });
      }, 100);

      return '0x1234567';
    });

    mockRequestManager.send.mockImplementationOnce(async payload => {
      expect(payload.method).toBe('eth_getTransactionReceipt');
      return {
        contractAddress: address,
        cumulativeGasUsed: '0xa',
        transactionIndex: '0x3',
        blockNumber: '0xa',
        blockHash: '0xafff',
        gasUsed: '0x0',
      };
    });

    return new Eth(mockRequestManager);
  };

  it('should use promise when subscribing and checking for receipt', async () => {
    const eth = bootstrap1();

    const result = await eth.sendTransaction({
      from: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
      to: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
      value: '0xa',
      gasPrice: '23435234234',
    });

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

    eth
      .sendTransaction({
        from: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
        to: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
        value: '0xa',
        gasPrice: '23435234234',
      })
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
      });
  });

  it('should use promise when subscribing and checking for deployed contract', async () => {
    const eth = bootstrap1();

    mockRequestManager.send.mockImplementationOnce(async payload => {
      expect(payload.method).toBe('eth_getCode');
      return '0x321';
    });

    const result = await eth.sendTransaction({
      from: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
      data: '0xa123456',
      gasPrice: '23435234234',
    });

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

    mockRequestManager.send.mockImplementationOnce(async payload => {
      expect(payload.method).toBe('eth_getCode');
      return '0x321';
    });

    eth
      .sendTransaction({
        from: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
        data: '0xa123456',
        gasPrice: '23435234234',
      })
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
      });
  });

  it('should fail with promise when deploying contract (empty code)', async () => {
    const eth = bootstrap1();

    mockRequestManager.send.mockImplementationOnce(async payload => {
      expect(payload.method).toBe('eth_getCode');
      return '0x';
    });

    await expect(
      eth.sendTransaction({
        from: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
        data: '0xa123456',
        gasPrice: '23435234234',
      }),
    ).rejects.toBeInstanceOf(Error);
  });

  it('should fail with emitter when deploying contract (empty code)', done => {
    const eth = bootstrap1();

    mockRequestManager.send.mockImplementationOnce(async payload => {
      expect(payload.method).toBe('eth_getCode');
      return '0x';
    });

    eth
      .sendTransaction({
        from: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
        data: '0xa123456',
        gasPrice: '23435234234',
      })
      .on('error', function(error) {
        expect(error).toBeInstanceOf(Error);
        done();
      });
  });

  it('should fail with promise when deploying contract (no address)', async () => {
    const eth = bootstrap1(null);

    await expect(
      eth.sendTransaction({
        from: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
        data: '0xa123456',
        gasPrice: '23435234234',
      }),
    ).rejects.toBeInstanceOf(Error);
  });

  it('should fail with emitter when deploying contract (no address)', done => {
    const eth = bootstrap1(null);

    eth
      .sendTransaction({
        from: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
        data: '0xa123456',
        gasPrice: '23435234234',
      })
      .on('error', function(error) {
        expect(error).toBeInstanceOf(Error);
      })
      .catch(function(error) {
        expect(error).toBeInstanceOf(Error);
        done();
      });
  });

  const failOnTimeout = function() {
    mockRequestManager.send.mockImplementationOnce(async payload => {
      expect(payload.method).toBe('eth_sendTransaction');
      return '0x1234567453543456321456321';
    });

    mockRequestManager.send.mockImplementationOnce(async payload => {
      expect(payload.method).toBe('eth_getTransactionReceipt');
      return null;
    });

    mockRequestManager.send.mockImplementationOnce(async payload => {
      expect(payload.method).toBe('eth_subscribe');

      // Fire 50 fake newBlocks
      for (let i = 0; i < 51; i++) {
        setTimeout(function() {
          mockRequestManager.provider.emit('0x1234567', null, {
            method: 'eth_subscription',
            params: {
              subscription: '0x1234567',
              result: {
                blockNumber: '0x10',
              },
            },
          });
        }, i * 10);
      }

      return '0x1234567';
    });

    return new Eth(mockRequestManager);
  };

  it('should fail with promise after no receipt after 50 blocks', async () => {
    const eth = failOnTimeout();

    await expect(
      eth.sendTransaction({
        from: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
        data: '0xa123456',
        gasPrice: '23435234234',
      }),
    ).rejects.toBeInstanceOf(Error);
  });

  it('should fail with emitter after no receipt after 50 blocks', done => {
    const eth = failOnTimeout();

    eth
      .sendTransaction({
        from: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
        data: '0xa123456',
        gasPrice: '23435234234',
      })
      .on('error', function(error) {
        expect(error).toBeInstanceOf(Error);
        done();
      });
  });

  it('should receive emitted confirmation receipts', function(done) {
    mockRequestManager.send.mockImplementationOnce(async payload => {
      expect(payload.method).toBe('eth_sendTransaction');
      return '0x1234567453543456321456321';
    });

    mockRequestManager.send.mockImplementationOnce(async payload => {
      expect(payload.method).toBe('eth_getTransactionReceipt');
      return null;
    });

    mockRequestManager.send.mockImplementationOnce(async payload => {
      expect(payload.method).toBe('eth_subscribe');

      // Fire 10 fake newBlocks
      for (let i = 0; i < 10; i++) {
        setTimeout(function() {
          mockRequestManager.provider.emit('0x1234567', null, {
            method: 'eth_subscription',
            params: {
              subscription: '0x1234567',
              result: {
                blockNumber: '0x10',
              },
            },
          });
        }, i * 10);
      }

      return '0x1234567';
    });

    mockRequestManager.send.mockImplementation(async payload => {
      return {
        contractAddress: null,
        cumulativeGasUsed: '0xa',
        transactionIndex: '0x3',
        blockNumber: '0xa',
        blockHash: '0xafff',
        gasUsed: '0x0',
      };
    });

    const eth = new Eth(mockRequestManager);

    let countConf = 0;

    eth
      .sendTransaction({
        from: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
        to: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
        gasPrice: '23435234234',
      })
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
