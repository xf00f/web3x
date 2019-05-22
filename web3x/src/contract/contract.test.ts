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
import { Eth } from '../eth/eth';
import { RawLogResponse, RawTransactionReceipt } from '../formatters';
import { MockEthereumProvider } from '../providers/mock-ethereum-provider';
import { bufferToHex, sha3 } from '../utils';
import { Contract } from './contract';
import { TestContract, TestContractAbi } from './fixtures/TestContract';
import { TestNoCtorContract } from './fixtures/TestNoCtorContract';

describe('contract', () => {
  const address = Address.fromString('0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe');
  const addressLowercase = address.toString().toLowerCase();
  const addressUnprefixedLowercase = addressLowercase.slice(2);
  const address2 = Address.fromString('0x5555567890123456789012345678901234567891');
  const address2Lowercase = address2.toString().toLowerCase();
  const blockHeader = {
    hash: '0xd6960376d6c6dea93647383ffb245cfced97ccc5c7525397a543a72fdaea5265',
    parentHash: '0x83ffb245cfced97ccc5c75253d6960376d6c6dea93647397a543a72fdaea5265',
    miner: '0xdcc6960376d6c6dea93647383ffb245cfced97cf',
    stateRoot: '0x54dda68af07643f68739a6e9612ad157a26ae7e2ce81f77842bb5835fbcde583',
    transactionsRoot: '0x64dda68af07643f68739a6e9612ad157a26ae7e2ce81f77842bb5835fbcde583',
    receiptsRoot: '0x74dda68af07643f68739a6e9612ad157a26ae7e2ce81f77842bb5835fbcde583',
    sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
    logsBloom: '0xd6960376d6c6dea93647383ffb245cfced97ccc5c7525397a543a72fdaea5265',
    difficulty: '0x3e8',
    totalDifficulty: '0x3e8',
    number: '0x11',
    gasLimit: '0x3e8',
    gasUsed: '0x3e8',
    timestamp: '0x3e8',
    extraData: '0xd6960376d6c6dea93647383ffb245cfced97ccc5c7525397a543a72fdaea5265',
    nonce: '0xd6960376d6c6dea93647383ffb245cfced97ccc5c7525397a543a72fdaea5265',
    size: '0x3e8',
    transactions: [],
    uncles: [],
  };
  let eth: Eth;
  let mockEthereumProvider: MockEthereumProvider;

  beforeEach(() => {
    mockEthereumProvider = new MockEthereumProvider();
    eth = new Eth(mockEthereumProvider);
  });

  describe('instantiation', () => {
    it('should construct without address', () => {
      const contract = new TestContract(eth);
      expect(contract.address).toBeUndefined();
    });

    it('should transform address from checksum addresses', () => {
      const contract = new TestContract(eth, address);
      expect(contract.address).toBe(address);
    });

    it('should transform address to checksum address', () => {
      const contract = new TestContract(eth, address);
      expect(contract.address).toBe(address);
    });
  });

  describe('event', () => {
    const signature = 'Changed(address,uint256,uint256,uint256)';

    function emitData(delayMs: number = 0, extend?: object) {
      setTimeout(() => {
        mockEthereumProvider.emit('notification', {
          subscription: '0x123',
          result: {
            address: addressLowercase,
            topics: [
              sha3(signature),
              '0x000000000000000000000000' + addressLowercase.replace('0x', ''),
              '0x0000000000000000000000000000000000000000000000000000000000000001',
            ],
            blockNumber: '0x3',
            transactionIndex: '0x0',
            transactionHash: '0x1234',
            blockHash: '0x1345',
            logIndex: '0x4',
            data:
              '0x0000000000000000000000000000000000000000000000000000000000000001' +
              '0000000000000000000000000000000000000000000000000000000000000008',
            ...extend,
          },
        });
      }, delayMs);
    }

    function mockEthSubscribe() {
      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_subscribe');
        expect(params[1]).toEqual({
          topics: [sha3(signature), '0x000000000000000000000000' + addressUnprefixedLowercase, null],
          address: addressLowercase,
        });

        emitData(10);

        return '0x123';
      });
    }

    it('should create event subscription', done => {
      mockEthSubscribe();

      const contract = new TestContract(eth, address);

      const event = contract.events.Changed({ filter: { from: address } }, (err, result) => {
        if (err) {
          return done(err);
        }
        expect(result.returnValues.from).toEqual(address);
        expect(result.returnValues.amount).toBe('1');
        expect(result.returnValues.t1).toBe('1');
        expect(result.returnValues.t2).toBe('8');

        event.unsubscribe();
        done();
      });
    });

    it('should create event from the events object using a signature and callback', done => {
      mockEthSubscribe();

      const contract = new TestContract(eth, address);

      const event = contract.events['0x792991ed5ba9322deaef76cff5051ce4bedaaa4d097585970f9ad8f09f54e651'](
        { filter: { from: address } },
        (err, result) => {
          expect(result.returnValues.from).toEqual(address);
          expect(result.returnValues.amount).toBe('1');
          expect(result.returnValues.t1).toBe('1');
          expect(result.returnValues.t2).toBe('8');

          event.unsubscribe();
          done();
        },
      );
    });

    it('should create event from the events object using event name and parameters', done => {
      mockEthSubscribe();

      const contract = new TestContract(eth, address);

      const event = contract.events[signature]({ filter: { from: address } }, (err, result) => {
        expect(result.returnValues.from).toEqual(address);
        expect(result.returnValues.amount).toBe('1');
        expect(result.returnValues.t1).toBe('1');
        expect(result.returnValues.t2).toBe('8');

        event.unsubscribe();
        done();
      });
    });

    it('should create event from the events object and use the fromBlock option', done => {
      mockEthereumProvider.send.mockImplementationOnce(method => {
        expect(method).toBe('eth_getLogs');
        return [
          {
            address: addressLowercase,
            topics: [
              sha3(signature),
              '0x000000000000000000000000' + addressLowercase.replace('0x', ''),
              '0x0000000000000000000000000000000000000000000000000000000000000002',
            ],
            blockNumber: '0x3',
            transactionHash: '0x1234',
            transactionIndex: '0x0',
            blockHash: '0x1345',
            logIndex: '0x4',
            data:
              '0x0000000000000000000000000000000000000000000000000000000000000002' +
              '0000000000000000000000000000000000000000000000000000000000000009',
          },
          {
            address: addressLowercase,
            topics: [
              sha3(signature),
              '0x000000000000000000000000' + addressLowercase.replace('0x', ''),
              '0x0000000000000000000000000000000000000000000000000000000000000003',
            ],
            blockNumber: '0x4',
            transactionHash: '0x1235',
            transactionIndex: '0x1',
            blockHash: '0x1346',
            logIndex: '0x1',
            data:
              '0x0000000000000000000000000000000000000000000000000000000000000004' +
              '0000000000000000000000000000000000000000000000000000000000000005',
          },
        ] as RawLogResponse[];
      });

      mockEthSubscribe();

      const contract = new TestContract(eth, address);
      let count = 0;

      const event = contract.events.Changed({ fromBlock: 0, filter: { from: address } }).on('data', result => {
        count++;

        if (count === 1) {
          expect(result.returnValues.from).toEqual(address);
          expect(result.returnValues.amount).toBe('2');
          expect(result.returnValues.t1).toBe('2');
          expect(result.returnValues.t2).toBe('9');
        }
        if (count === 2) {
          expect(result.returnValues.from).toEqual(address);
          expect(result.returnValues.amount).toBe('3');
          expect(result.returnValues.t1).toBe('4');
          expect(result.returnValues.t2).toBe('5');
        }
        if (count === 3) {
          expect(result.returnValues.from).toEqual(address);
          expect(result.returnValues.amount).toBe('1');
          expect(result.returnValues.t1).toBe('1');
          expect(result.returnValues.t2).toBe('8');

          event.unsubscribe();
          done();
        }
      });
    });

    it('should create event using the function and unsubscribe after one log received', async () => {
      mockEthSubscribe();

      let count = 0;

      const contract = new TestContract(eth, address);

      await new Promise(resolve => {
        contract.once('Changed', { filter: { from: address } }, (err, result, sub) => {
          count++;
          resolve();
        });
      });

      // Emit a second.
      mockEthereumProvider.emit('notification', {
        subscription: '0x123',
        result: {
          blockHash: '0x1345',
        },
      });

      expect(count).toBe(1);
    });

    it('should create event subscription and fire the changed event, if log.removed = true', done => {
      mockEthSubscribe();
      emitData(200, { removed: true });

      let count = 1;
      const contract = new TestContract(eth, address);

      contract.events
        .Changed({ filter: { from: address } })
        .on('data', result => {
          expect(count).toBe(1);
          count++;
        })
        .on('changed', result => {
          expect(result.removed).toBe(true);
          expect(count).toBe(2);
          done();
        });
    });

    it('should create all event filter and receive two logs', done => {
      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_subscribe');
        expect(params[1]).toEqual({
          topics: [],
          address: addressLowercase,
        });

        emitData(100);
        emitData(200, {
          topics: [
            sha3('Unchanged(uint256,address,uint256)'),
            '0x0000000000000000000000000000000000000000000000000000000000000002',
            '0x000000000000000000000000' + address.toString().replace('0x', ''),
          ],
          data: '0x0000000000000000000000000000000000000000000000000000000000000005',
        });

        return '0x123';
      });

      const contract = new TestContract(eth, address);

      let count = 0;
      const event = contract.events.allEvents({}, (_, result) => {
        count++;

        if (count === 1 && result.event === 'Changed') {
          expect(result.returnValues.from).toEqual(address);
          expect(result.returnValues.amount).toBe('1');
          expect(result.returnValues.t1).toBe('1');
          expect(result.returnValues.t2).toBe('8');
        }
        if (count === 2 && result.event === 'Unchanged') {
          expect(result.returnValues.addressFrom).toEqual(address);
          expect(result.returnValues.value).toBe('2');
          expect(result.returnValues.t1).toBe('5');

          event.unsubscribe();
          done();
        }
      });
    });
  });

  describe('balance call', () => {
    const signature = 'balance(address)';

    it('should encode a function call', () => {
      const contract = new TestContract(eth, address);

      const result = contract.methods.balance(address).encodeABI();

      expect(bufferToHex(result)).toBe(
        sha3(signature).slice(0, 10) + '000000000000000000000000' + addressUnprefixedLowercase,
      );
    });

    it('should encode a constructor call with data', () => {
      const contract = new TestContract(eth, address);

      const result = contract.deployBytecode('0x1234', address, 10).encodeABI();

      expect(bufferToHex(result)).toBe(
        '0x1234' +
          '000000000000000000000000' +
          addressLowercase.replace('0x', '') +
          '000000000000000000000000000000000000000000000000000000000000000a',
      );
    });

    it('should estimate a function', async () => {
      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_estimateGas');
        expect(params).toEqual([
          {
            data: sha3(signature).slice(0, 10) + '000000000000000000000000' + addressLowercase.replace('0x', ''),
            to: addressLowercase,
          },
        ]);
        return '0x0000000000000000000000000000000000000000000000000000000000000032';
      });

      const contract = new TestContract(eth, address);

      const res = await contract.methods.balance(address).estimateGas();
      expect(res).toBe(50);
    });

    it('should estimate the constructor', async () => {
      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_estimateGas');
        expect(params).toEqual([
          {
            data:
              '0x1234000000000000000000000000' +
              addressLowercase.replace('0x', '') +
              '0000000000000000000000000000000000000000000000000000000000000032',
          },
        ]);
        return '0x000000000000000000000000000000000000000000000000000000000000000a';
      });

      const contract = new TestContract(eth, address);

      const res = await contract.deployBytecode('0x1234', address, 50).estimateGas();
      expect(res).toBe(10);
    });

    it('should send with many parameters', async () => {
      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_call');
        expect(params).toEqual([
          {
            data:
              '0x8708f4a12454534500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000c30786666323435343533343500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004ff24545345000000000000000000000000000000000000000000000000000000534500000000000000000000000000000000000000000000000000000000000045450000000000000000000000000000000000000000000000000000000000004533450000000000000000000000000000000000000000000000000000000000',
            to: addressLowercase,
          },
          'latest',
        ]);
        return '0x000000000000000000000000' + addressLowercase.replace('0x', '');
      });

      const contract = new TestContract(eth, address);

      const res = await contract.methods
        .hasALotOfParams('0x24545345', '0xff24545345', ['0xff24545345', '0x5345', '0x4545', '0x453345'])
        .call();
      expect(res).toEqual(address);
    });

    it('should send overload functions with zero parameters', async () => {
      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_call');
        expect(params).toEqual([
          {
            data: '0xbb853481',
            to: addressLowercase,
          },
          'latest',
        ]);
        return '0x0000000000000000000000000000000000000000000000000000000000000005';
      });

      const contract = new TestContract(eth, address);
      const res = await contract.methods.overloadedFunction().call();
      expect(res).toBe('5');
    });

    it('should send overload functions with one parameters', async () => {
      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_call');
        expect(params).toEqual([
          {
            data: '0x533678270000000000000000000000000000000000000000000000000000000000000006',
            to: addressLowercase,
          },
          'latest',
        ]);
        return '0x0000000000000000000000000000000000000000000000000000000000000006';
      });

      const contract = new TestContract(eth, address);

      const res = await contract.methods.overloadedFunction(6).call();
      expect(res).toBe('6');
    });

    it('should call constant function', async () => {
      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_call');
        expect(params).toEqual([
          {
            data: sha3(signature).slice(0, 10) + '000000000000000000000000' + addressLowercase.replace('0x', ''),
            to: addressLowercase,
          },
          'latest',
        ]);
        return '0x0000000000000000000000000000000000000000000000000000000000000032';
      });

      const contract = new TestContract(eth, address);

      const res = await contract.methods.balance(address).call();
      expect(res).toBe('50');
    });

    it('should call constant function with default block', async () => {
      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_call');
        expect(params).toEqual([
          {
            data: sha3(signature).slice(0, 10) + '000000000000000000000000' + addressLowercase.replace('0x', ''),
            to: addressLowercase,
          },
          '0xb',
        ]);
        return '0x0000000000000000000000000000000000000000000000000000000000000032';
      });

      const contract = new TestContract(eth, address);

      const res = await contract.methods.balance(address).call({}, 11);
      expect(res).toBe('50');
    });

    it('should call constant concurrently', async () => {
      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_call');
        expect(params).toEqual([
          {
            data:
              sha3('balance(address)').slice(0, 10) + '000000000000000000000000' + addressLowercase.replace('0x', ''),
            to: addressLowercase,
          },
          'latest',
        ]);
        return '0x000000000000000000000000000000000000000000000000000000000000000a';
      });

      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_call');
        expect(params).toEqual([
          {
            data: sha3('owner()').slice(0, 10),
            to: addressLowercase,
          },
          'latest',
        ]);
        return '0x00000000000000000000000011f4d0a3c12e86b4b5f39b213f7e19d048276dae';
      });

      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_call');
        expect(params).toEqual([
          {
            data: sha3('getStr()').slice(0, 10),
            to: addressLowercase,
          },
          'latest',
        ]);
        return '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000848656c6c6f212521000000000000000000000000000000000000000000000000';
      });

      const contract = new TestContract(eth, address);

      const [m1, m2, m3] = await Promise.all([
        contract.methods.balance(address).call(),
        contract.methods.owner().call(),
        contract.methods.getStr().call(),
      ]);

      expect(m1).toBe('10');
      expect(m2).toEqual(address);
      expect(m3).toBe('Hello!%!');
    });

    it('should return an error when returned string is 0x', async () => {
      const signature = 'getStr()';

      const contract = new TestContract(eth, address);

      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_call');
        expect(params).toEqual([
          {
            data: sha3(signature).slice(0, 10),
            to: addressLowercase,
            from: address2,
          },
          'latest',
        ]);
        return '0x';
      });

      await expect(contract.methods.getStr().call({ from: address2 })).rejects.toBeInstanceOf(Error);
    });

    it('should return an empty string when 0x0', async () => {
      const signature = 'getStr()';

      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_call');
        expect(params).toEqual([
          {
            data: sha3(signature).slice(0, 10),
            to: addressLowercase,
            from: address2.toString().toLowerCase(),
          },
          'latest',
        ]);
        return '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000';
      });

      const contract = new TestContract(eth, address);

      const result = await contract.methods.getStr().call({ from: address2 });
      expect(result).toBe('');
    });
  });

  describe('send', () => {
    const signature = sha3('mySend(address,uint256)').slice(0, 10);

    function bootstrap() {
      // eth_sendTransaction
      mockEthereumProvider.send.mockResolvedValueOnce(
        '0x1234000000000000000000000000000000000000000000000000000000056789',
      );

      // eth_getTransactionReceipt
      mockEthereumProvider.send.mockResolvedValueOnce({
        from: address2Lowercase,
        to: addressLowercase,
        contractAddress: null,
        cumulativeGasUsed: '0xa',
        transactionIndex: '0x3',
        transactionHash: '0x1234',
        blockNumber: '0xa',
        blockHash: '0x1234',
        gasUsed: '0x0',
        logs: [
          {
            address: addressLowercase,
            topics: [
              sha3('Unchanged(uint256,address,uint256)'),
              '0x0000000000000000000000000000000000000000000000000000000000000002',
              '0x000000000000000000000000' + addressLowercase.replace('0x', ''),
            ],
            blockNumber: '0xa',
            transactionHash: '0x1234',
            transactionIndex: '0x0',
            blockHash: '0x1345',
            logIndex: '0x0',
            data: '0x0000000000000000000000000000000000000000000000000000000000000005',
          },
          {
            address: addressLowercase,
            topics: [
              sha3('Changed(address,uint256,uint256,uint256)'),
              '0x000000000000000000000000' + addressLowercase.replace('0x', ''),
              '0x0000000000000000000000000000000000000000000000000000000000000001',
            ],
            blockNumber: '0xa',
            transactionHash: '0x1234',
            transactionIndex: '0x0',
            blockHash: '0x1345',
            logIndex: '0x1',
            data:
              '0x0000000000000000000000000000000000000000000000000000000000000001' +
              '0000000000000000000000000000000000000000000000000000000000000008',
          },
          {
            address: address2Lowercase,
            topics: [sha3('IgnoredDueToUnmatchingAddress()')],
            blockNumber: '0xa',
            transactionHash: '0x1234',
            transactionIndex: '0x0',
            blockHash: '0x1345',
            logIndex: '0x2',
            data: '0x',
          },
        ],
      });
    }

    it('should create correct receipt', async () => {
      bootstrap();

      const contract = new TestContract(eth, address);

      const receipt = await contract.methods
        .mySend(address, 10)
        .send({ from: address2, gasPrice: '21345678654321' })
        .getReceipt();

      expect(receipt).toEqual({
        from: address2,
        to: address,
        cumulativeGasUsed: 10,
        transactionIndex: 3,
        transactionHash: '0x1234',
        blockNumber: 10,
        blockHash: '0x1234',
        gasUsed: 0,
        contractAddress: undefined,
        status: undefined,
        anonymousLogs: expect.any(Array),
        events: expect.any(Object),
      });
    });

    it('should correctly filter receipts anonymous logs', async () => {
      bootstrap();

      const contract = new TestContract(eth, address);

      const receipt = await contract.methods
        .mySend(address, 10)
        .send({ from: address2, gasPrice: '21345678654321' })
        .getReceipt();

      expect(receipt.anonymousLogs).toEqual([
        {
          id: 'log_0c7b7b69',
          address: address2,
          topics: [sha3('IgnoredDueToUnmatchingAddress()')],
          blockNumber: 10,
          transactionHash: '0x1234',
          transactionIndex: 0,
          blockHash: '0x1345',
          logIndex: 2,
          data: '0x',
        },
      ]);
    });

    it('should correctly extract receipts events', async () => {
      bootstrap();

      const contract = new TestContract(eth, address);

      const receipt = await contract.methods
        .mySend(address, 10)
        .send({ from: address2, gasPrice: '21345678654321' })
        .getReceipt();

      expect(receipt.events).toEqual({
        Unchanged: [
          {
            address,
            blockNumber: 10,
            transactionHash: '0x1234',
            blockHash: '0x1345',
            logIndex: 0,
            id: 'log_eb38a24f',
            transactionIndex: 0,
            returnValues: expect.any(Object),
            event: 'Unchanged',
            signature: '0xf359668f205d0b5cfdc20d11353e05f633f83322e96f15486cbb007d210d66e5',
            raw: {
              topics: [
                '0xf359668f205d0b5cfdc20d11353e05f633f83322e96f15486cbb007d210d66e5',
                '0x0000000000000000000000000000000000000000000000000000000000000002',
                '0x000000000000000000000000' + addressUnprefixedLowercase,
              ],
              data: '0x0000000000000000000000000000000000000000000000000000000000000005',
            },
          },
        ],
        Changed: [
          {
            address,
            blockNumber: 10,
            transactionHash: '0x1234',
            blockHash: '0x1345',
            logIndex: 1,
            id: 'log_e6d0b97d',
            transactionIndex: 0,
            returnValues: expect.any(Object),
            event: 'Changed',
            signature: '0x792991ed5ba9322deaef76cff5051ce4bedaaa4d097585970f9ad8f09f54e651',
            raw: {
              topics: [
                '0x792991ed5ba9322deaef76cff5051ce4bedaaa4d097585970f9ad8f09f54e651',
                '0x000000000000000000000000' + addressUnprefixedLowercase,
                '0x0000000000000000000000000000000000000000000000000000000000000001',
              ],
              data:
                '0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000008',
            },
          },
        ],
      });
    });

    it('should correctly decode receipts event logs', async () => {
      bootstrap();

      const contract = new TestContract(eth, address);

      const receipt = await contract.methods
        .mySend(address, 10)
        .send({ from: address2, gasPrice: '21345678654321' })
        .getReceipt();

      expect(receipt.events!.Changed[0].returnValues).toEqual({
        0: address,
        1: '1',
        2: '1',
        3: '8',
        from: address,
        amount: '1',
        t1: '1',
        t2: '8',
      });

      expect(receipt.events!.Unchanged[0].returnValues).toEqual({
        0: '2',
        1: address,
        2: '5',
        value: '2',
        addressFrom: address,
        t1: '5',
      });
    });

    it('should correctly decode multiple of the same event log', async () => {
      mockEthereumProvider.send.mockResolvedValueOnce(
        '0x1234000000000000000000000000000000000000000000000000000000056789',
      );

      mockEthereumProvider.send.mockResolvedValueOnce({
        from: address2Lowercase,
        to: addressLowercase,
        contractAddress: null,
        cumulativeGasUsed: '0xa',
        transactionIndex: '0x3',
        transactionHash: '0x1234',
        blockNumber: '0xa',
        blockHash: '0x1234',
        gasUsed: '0x0',
        logs: [
          {
            address,
            topics: [
              sha3('Changed(address,uint256,uint256,uint256)'),
              '0x000000000000000000000000' + addressLowercase.replace('0x', ''),
              '0x0000000000000000000000000000000000000000000000000000000000000001',
            ],
            blockNumber: '0xa',
            transactionHash: '0x1234',
            transactionIndex: '0x0',
            blockHash: '0x1345',
            logIndex: '0x4',
            data:
              '0x0000000000000000000000000000000000000000000000000000000000000001' +
              '0000000000000000000000000000000000000000000000000000000000000008',
          },
          {
            address,
            topics: [
              sha3('Changed(address,uint256,uint256,uint256)'),
              '0x000000000000000000000000' + addressLowercase.replace('0x', ''),
              '0x0000000000000000000000000000000000000000000000000000000000000002',
            ],
            blockNumber: '0xa',
            transactionHash: '0x1234',
            transactionIndex: '0x0',
            blockHash: '0x1345',
            logIndex: '0x5',
            data:
              '0x0000000000000000000000000000000000000000000000000000000000000001' +
              '0000000000000000000000000000000000000000000000000000000000000008',
          },
        ],
      });

      const contract = new TestContract(eth, address);

      const receipt = await contract.methods
        .mySend(address, 10)
        .send({ from: address2, gasPrice: '21345678654321' })
        .getReceipt();

      expect(receipt.events).toEqual({
        Changed: [
          {
            address,
            blockNumber: 10,
            transactionHash: '0x1234',
            blockHash: '0x1345',
            logIndex: 4,
            id: 'log_9ff24cb4',
            transactionIndex: 0,
            returnValues: {
              0: address,
              1: '1',
              2: '1',
              3: '8',
              from: address,
              amount: '1',
              t1: '1',
              t2: '8',
            },
            event: 'Changed',
            signature: '0x792991ed5ba9322deaef76cff5051ce4bedaaa4d097585970f9ad8f09f54e651',
            raw: {
              topics: [
                '0x792991ed5ba9322deaef76cff5051ce4bedaaa4d097585970f9ad8f09f54e651',
                '0x000000000000000000000000' + addressLowercase.replace('0x', ''),
                '0x0000000000000000000000000000000000000000000000000000000000000001',
              ],
              data:
                '0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000008',
            },
          },
          {
            address,
            blockNumber: 10,
            transactionHash: '0x1234',
            blockHash: '0x1345',
            logIndex: 5,
            id: 'log_8b8a2b7f',
            transactionIndex: 0,
            returnValues: {
              0: address,
              1: '2',
              2: '1',
              3: '8',
              from: address,
              amount: '2',
              t1: '1',
              t2: '8',
            },
            event: 'Changed',
            signature: '0x792991ed5ba9322deaef76cff5051ce4bedaaa4d097585970f9ad8f09f54e651',
            raw: {
              topics: [
                '0x792991ed5ba9322deaef76cff5051ce4bedaaa4d097585970f9ad8f09f54e651',
                '0x000000000000000000000000' + addressLowercase.replace('0x', ''),
                '0x0000000000000000000000000000000000000000000000000000000000000002',
              ],
              data:
                '0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000008',
            },
          },
        ],
      });
    });

    it('should sendTransaction and receive multiple confirmations', done => {
      // eth_sendTransaction
      mockEthereumProvider.send.mockResolvedValueOnce(
        '0x1234000000000000000000000000000000000000000000000000000000056789',
      );

      // eth_getTransactionReceipt
      mockEthereumProvider.send.mockResolvedValueOnce({
        from: address2Lowercase,
        cumulativeGasUsed: '0xa',
        transactionIndex: '0x3',
        transactionHash: '0x1234',
        blockNumber: '0xa',
        blockHash: '0x1234',
        gasUsed: '0x0',
        logs: [],
      });

      // eth_subscribe
      mockEthereumProvider.send.mockResolvedValueOnce('0x123');

      setTimeout(() => {
        mockEthereumProvider.emit('notification', {
          subscription: '0x123',
          result: {
            ...blockHeader,
            number: '0xa',
          },
        });
      }, 100);

      setTimeout(() => {
        mockEthereumProvider.emit('notification', {
          subscription: '0x123',
          result: {
            ...blockHeader,
            number: '0xb',
          },
        });
      }, 200);

      const contract = new TestContract(eth, address);

      let count = 0;
      contract.methods
        .mySend(address, 10)
        .send({ from: address2, gasPrice: '21345678654321' })
        .getReceipt(2, (confirmationNumber, receipt) => {
          count++;
          if (count === 1) {
            expect(receipt).toEqual({
              from: address2,
              cumulativeGasUsed: 10,
              transactionIndex: 3,
              transactionHash: '0x1234',
              blockNumber: 10,
              blockHash: '0x1234',
              gasUsed: 0,
              anonymousLogs: [],
              events: {},
            });

            expect(confirmationNumber).toBe(1);
          }
          if (count === 2) {
            expect(receipt).toEqual({
              from: address2,
              cumulativeGasUsed: 10,
              transactionIndex: 3,
              transactionHash: '0x1234',
              blockNumber: 10,
              blockHash: '0x1234',
              gasUsed: 0,
              anonymousLogs: [],
              events: {},
            });

            expect(confirmationNumber).toBe(2);
            done();
          }
        })
        .catch(done);
    });

    it('should sendTransaction to contract function', async () => {
      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_sendTransaction');
        expect(params).toEqual([
          {
            data:
              signature +
              '000000000000000000000000' +
              addressLowercase.replace('0x', '') +
              '0000000000000000000000000000000000000000000000000000000000000011',
            from: addressLowercase,
            to: addressLowercase,
            gasPrice: '0x369d1f7fd2',
          },
        ]);
      });

      // eth_getTransactionReceipt
      mockEthereumProvider.send.mockResolvedValueOnce({
        blockHash: '0x1234',
      });

      const contract = new TestContract(eth, address);

      await contract.methods.mySend(address, 17).send({ from: address, gasPrice: '234564321234' });
    });

    it('should throw error when trying to send ether to a non payable contract function', async () => {
      const contract = new TestContract(eth, address);

      await expect(() =>
        contract.methods.myDisallowedSend(address, 17).send({ from: address, value: 123 }),
      ).toThrowError(/non-payable/);
    });

    it('should not throw error when trying to not send ether to a non payable contract function', async () => {
      const signature = 'myDisallowedSend(address,uint256)';

      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_sendTransaction');
        expect(params).toEqual([
          {
            data:
              sha3(signature).slice(0, 10) +
              '000000000000000000000000' +
              addressLowercase.replace('0x', '') +
              '0000000000000000000000000000000000000000000000000000000000000011',
            from: addressLowercase,
            to: addressLowercase,
            gasPrice: '0x1555757ee6b1',
          },
        ]);
      });

      mockEthereumProvider.send.mockResolvedValueOnce({
        contractAddress: null,
        cumulativeGasUsed: '0xa',
        transactionIndex: '0x3',
        transactionHash: '0x1234',
        blockNumber: '0xa',
        blockHash: '0x1234',
        gasUsed: '0x0',
        logs: [],
      });

      const contract = new TestContract(eth, address);

      await contract.methods.myDisallowedSend(address, 17).send({ from: address, gasPrice: '23456787654321' });
    });

    it('should sendTransaction to contract function using the function name incl. parameters', async () => {
      // eth_sendTransaction
      mockEthereumProvider.send.mockResolvedValueOnce(
        '0x1234000000000000000000000000000000000000000000000000000000056789',
      );

      // eth_getTransactionReceipt
      mockEthereumProvider.send.mockResolvedValueOnce({
        blockHash: '0x1234',
      });

      const contract = new TestContract(eth, address);

      await contract.methods['mySend(address,uint256)'](address, 17)
        .send({
          from: address,
          gasPrice: '23456787654321',
        })
        .getTxHash();

      expect(mockEthereumProvider.send).toHaveBeenCalledWith('eth_sendTransaction', [
        {
          data:
            signature +
            '000000000000000000000000' +
            addressLowercase.replace('0x', '') +
            '0000000000000000000000000000000000000000000000000000000000000011',
          from: addressLowercase,
          to: addressLowercase,
          gasPrice: '0x1555757ee6b1',
        },
      ]);
    });

    it('should sendTransaction to contract function using the signature', async () => {
      // eth_sendTransaction
      mockEthereumProvider.send.mockResolvedValueOnce(
        '0x1234000000000000000000000000000000000000000000000000000000056789',
      );

      // eth_getTransactionReceipt
      mockEthereumProvider.send.mockResolvedValueOnce({
        blockHash: '0x1234',
      });

      const contract = new TestContract(eth, address);

      await contract.methods[signature](address, 17)
        .send({ from: address, gasPrice: '1230000000' })
        .getTxHash();

      expect(mockEthereumProvider.send).toHaveBeenCalledWith('eth_sendTransaction', [
        {
          data:
            signature +
            '000000000000000000000000' +
            addressLowercase.replace('0x', '') +
            '0000000000000000000000000000000000000000000000000000000000000011',
          from: addressLowercase,
          to: addressLowercase,
          gasPrice: '0x49504f80',
        },
      ]);
    });

    it('should throw when trying to create a tx object and wrong amount of params', () => {
      const contract = new Contract(eth, TestContractAbi, address);
      expect(() => contract.methods.mySend(address)).toThrowError('No matching method with 1 arguments for mySend.');
    });

    it('should make a call with optional params', done => {
      const signature = 'balance(address)';
      let count = 0;

      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        count++;
        if (count > 1) {
          return;
        }

        expect(method).toBe('eth_call');
        expect(params).toEqual([
          {
            data: sha3(signature).slice(0, 10) + '000000000000000000000000' + addressLowercase.replace('0x', ''),
            to: addressLowercase,
            from: addressLowercase,
            gas: '0xc350',
          },
          'latest',
        ]);
        return '0x0000000000000000000000000000000000000000000000000000000000000032';
      });

      const contract = new TestContract(eth, address);

      contract.methods
        .balance(address)
        .call({ from: address, gas: 50000 })
        .then(r => {
          expect(r).toBe('50');
          done();
        });
    });

    it('should explicitly make a call with optional params', done => {
      const signature = 'balance(address)';

      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_call');
        expect(params).toEqual([
          {
            data: sha3(signature).slice(0, 10) + '000000000000000000000000' + addressLowercase.replace('0x', ''),
            to: addressLowercase,
            from: addressLowercase,
            gas: '0xc350',
          },
          'latest',
        ]);
        return '0x0000000000000000000000000000000000000000000000000000000000000032';
      });

      const contract = new TestContract(eth, address);

      contract.methods
        .balance(address)
        .call({ from: address, gas: 50000 })
        .then(r => {
          expect(r).toBe('50');
          done();
        });
    });

    it('should explicitly make a call with optional params and defaultBlock', done => {
      const signature = 'balance(address)';

      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_call');
        expect(params).toEqual([
          {
            data: sha3(signature).slice(0, 10) + '000000000000000000000000' + addressLowercase.replace('0x', ''),
            to: addressLowercase,
            from: addressLowercase,
            gas: '0xc350',
          },
          '0xb',
        ]);
        return '0x0000000000000000000000000000000000000000000000000000000000000032';
      });

      const contract = new TestContract(eth, address);

      contract.methods
        .balance(address)
        .call({ from: address, gas: 50000 }, 11)
        .then(r => {
          expect(r).toBe('50');
          done();
        });
    });

    it('should sendTransaction with optional params', async () => {
      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_sendTransaction');
        expect(params).toEqual([
          {
            data:
              signature +
              '000000000000000000000000' +
              addressLowercase.replace('0x', '') +
              '0000000000000000000000000000000000000000000000000000000000000011',
            to: addressLowercase,
            from: addressLowercase,
            gas: '0xc350',
            gasPrice: '0xbb8',
            value: '0x2710',
          },
        ]);
      });

      // eth_getTransactionReceipt
      mockEthereumProvider.send.mockResolvedValueOnce({
        blockHash: '0x1234',
      });

      const contract = new TestContract(eth, address);

      await contract.methods.mySend(address, 17).send({ from: address, gas: 50000, gasPrice: 3000, value: 10000 });
    });

    it('should sendTransaction and fill in default gasPrice', async () => {
      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_gasPrice');
        return '0x45656456456456';
      });

      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_sendTransaction');
        expect(params).toEqual([
          {
            data:
              signature +
              '000000000000000000000000' +
              addressLowercase.replace('0x', '') +
              '0000000000000000000000000000000000000000000000000000000000000011',
            to: addressLowercase,
            from: addressLowercase,
            gasPrice: '0x45656456456456',
          },
        ]);
      });

      // eth_getTransactionReceipt
      mockEthereumProvider.send.mockResolvedValueOnce({
        blockHash: '0x1234',
      });

      const contract = new TestContract(eth, address);

      await contract.methods.mySend(address, 17).send({ from: address });
    });

    it('should explicitly sendTransaction with optional params', async () => {
      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_sendTransaction');
        expect(params).toEqual([
          {
            data:
              signature +
              '000000000000000000000000' +
              addressLowercase.replace('0x', '') +
              '0000000000000000000000000000000000000000000000000000000000000011',
            to: addressLowercase,
            from: addressLowercase,
            gas: '0xc350',
            gasPrice: '0xbb8',
            value: '0x2710',
          },
        ]);
      });

      // eth_getTransactionReceipt
      mockEthereumProvider.send.mockResolvedValueOnce({
        blockHash: '0x1234',
      });

      const contract = new TestContract(eth, address);

      await contract.methods.mySend(address, 17).send({ from: address, gas: 50000, gasPrice: 3000, value: 10000 });
    });

    it('should explicitly estimateGas with optional params', async () => {
      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_estimateGas');
        expect(params).toEqual([
          {
            data:
              signature +
              '000000000000000000000000' +
              addressUnprefixedLowercase +
              '0000000000000000000000000000000000000000000000000000000000000011',
            to: addressLowercase,
            from: addressLowercase,
            gas: '0xc350',
            gasPrice: '0xbb8',
            value: '0x2710',
          },
        ]);

        return '0x10';
      });

      // eth_getTransactionReceipt
      mockEthereumProvider.send.mockResolvedValueOnce({
        blockHash: '0x1234',
      });

      const contract = new TestContract(eth, address);

      const gasUsed = await contract.methods
        .mySend(address, 17)
        .estimateGas({ from: address, gas: 50000, gasPrice: 3000, value: 10000 });

      expect(gasUsed).toBe(16);
    });

    it('getPastEvents should get past events and format them correctly', async () => {
      const signature = 'Changed(address,uint256,uint256,uint256)';

      const topic1 = [
        sha3(signature),
        '0x000000000000000000000000' + address.toString().replace('0x', ''),
        '0x000000000000000000000000000000000000000000000000000000000000000a',
      ];
      const topic2 = [
        sha3(signature),
        '0x000000000000000000000000' + address.toString().replace('0x', ''),
        '0x0000000000000000000000000000000000000000000000000000000000000003',
      ];

      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_getLogs');
        expect(params).toEqual([
          {
            address: addressLowercase,
            topics: [
              '0x792991ed5ba9322deaef76cff5051ce4bedaaa4d097585970f9ad8f09f54e651',
              '0x000000000000000000000000' + address2.toString().replace('0x', ''),
              null,
            ],
          },
        ]);

        return [
          {
            address,
            topics: topic1,
            blockNumber: '0x3',
            transactionHash: '0x1234',
            transactionIndex: '0x0',
            blockHash: '0x1345',
            logIndex: '0x4',
            data:
              '0x0000000000000000000000000000000000000000000000000000000000000002' +
              '0000000000000000000000000000000000000000000000000000000000000009',
          },
          {
            address,
            topics: topic2,
            blockNumber: '0x4',
            transactionHash: '0x1235',
            transactionIndex: '0x0',
            blockHash: '0x1346',
            logIndex: '0x1',
            data:
              '0x0000000000000000000000000000000000000000000000000000000000000004' +
              '0000000000000000000000000000000000000000000000000000000000000005',
          },
        ];
      });

      const contract = new TestContract(eth, address);

      const result = await contract.getPastEvents('Changed', { filter: { from: address2 } });

      expect(result).toEqual([
        {
          event: 'Changed',
          signature: '0x792991ed5ba9322deaef76cff5051ce4bedaaa4d097585970f9ad8f09f54e651',
          id: 'log_9ff24cb4',
          address,
          blockNumber: 3,
          transactionHash: '0x1234',
          blockHash: '0x1345',
          logIndex: 4,
          transactionIndex: 0,
          raw: {
            data:
              '0x0000000000000000000000000000000000000000000000000000000000000002' +
              '0000000000000000000000000000000000000000000000000000000000000009',
            topics: topic1,
          },
          returnValues: {
            0: address,
            1: '10',
            2: '2',
            3: '9',
            from: address,
            amount: '10',
            t1: '2',
            t2: '9',
          },
        },
        {
          event: 'Changed',
          signature: '0x792991ed5ba9322deaef76cff5051ce4bedaaa4d097585970f9ad8f09f54e651',
          id: 'log_29c93e15',
          address,
          blockNumber: 4,
          transactionHash: '0x1235',
          blockHash: '0x1346',
          logIndex: 1,
          transactionIndex: 0,
          raw: {
            data:
              '0x0000000000000000000000000000000000000000000000000000000000000004' +
              '0000000000000000000000000000000000000000000000000000000000000005',
            topics: topic2,
          },
          returnValues: {
            0: address,
            1: '3',
            2: '4',
            3: '5',
            from: address,
            amount: '3',
            t1: '4',
            t2: '5',
          },
        },
      ]);
    });

    it('should call testArr method and properly parse result', done => {
      const signature = 'testArr(int[])';

      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_call');
        expect(params).toEqual([
          {
            data:
              sha3(signature).slice(0, 10) +
              '0000000000000000000000000000000000000000000000000000000000000020' +
              '0000000000000000000000000000000000000000000000000000000000000001' +
              '0000000000000000000000000000000000000000000000000000000000000003',
            to: addressLowercase,
          },
          'latest',
        ]);
        return '0x0000000000000000000000000000000000000000000000000000000000000005';
      });

      // eth_getTransactionReceipt
      mockEthereumProvider.send.mockResolvedValueOnce({
        blockHash: '0x1234',
      });

      const contract = new TestContract(eth, address);

      contract.methods
        .testArr([3])
        .call()
        .then(result => {
          expect(result).toBe('5');
          done();
        });
    });

    it('should call owner method, properly', async () => {
      const signature = 'owner()';

      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_call');
        expect(params).toEqual([
          {
            data: sha3(signature).slice(0, 10),
            to: addressLowercase,
          },
          'latest',
        ]);
        return '0x000000000000000000000000' + addressLowercase.replace('0x', '');
      });

      // eth_getTransactionReceipt
      mockEthereumProvider.send.mockResolvedValueOnce({
        blockHash: '0x1234',
      });

      const contract = new TestContract(eth, address);

      const result = await contract.methods.owner().call();
      expect(result).toEqual(address);
    });

    it('should decode an struct correctly', done => {
      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_call');
        expect(params).toEqual([
          {
            data: '0x2a4aedd5000000000000000000000000' + addressUnprefixedLowercase,
            to: addressLowercase,
          },
          'latest',
        ]);
        return '0x0000000000000000000000000000000000000000000000000000000000000001';
      });

      const contract = new TestContract(eth, address);

      contract.methods
        .listOfNestedStructs(address)
        .call()
        .then(result => {
          const expectedArray: any = [];
          expectedArray[0] = true;
          expectedArray.status = true;

          expect(result).toEqual(expectedArray);
          done();
        });
    });

    it('should call an contract method with an struct as parameter', async () => {
      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_sendTransaction');
        expect(params).toEqual([
          {
            data: '0x814a4d160000000000000000000000000000000000000000000000000000000000000001',
            from: addressLowercase,
            gas: '0xc350',
            gasPrice: '0xbb8',
            to: addressLowercase,
          },
        ]);
      });

      // eth_getTransactionReceipt
      mockEthereumProvider.send.mockResolvedValueOnce({
        blockHash: '0x1234',
      });

      const contract = new TestContract(eth, address);

      await contract.methods.addStruct({ status: true }).send({
        from: address,
        gas: 50000,
        gasPrice: 3000,
      });
    });
  });

  describe('deploy', () => {
    const txReceipt: RawTransactionReceipt = {
      transactionHash: '0x123',
      from: addressLowercase,
      contractAddress: address2Lowercase,
      blockHash: '0xffdd',
      transactionIndex: '0x0',
      blockNumber: '0x0',
      cumulativeGasUsed: '0x1',
      gasUsed: '0x1',
    };

    it('should deploy a contract and use all promise steps', async () => {
      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_sendTransaction');
        expect(params).toEqual([
          {
            data:
              '0x01234567000000000000000000000000' +
              addressUnprefixedLowercase +
              '00000000000000000000000000000000000000000000000000000000000000c8',
            from: addressLowercase,
            gas: '0xc350',
            gasPrice: '0xbb8',
          },
        ]);
        return '0x5550000000000000000000000000000000000000000000000000000000000032';
      });

      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_getTransactionReceipt');
        expect(params).toEqual(['0x5550000000000000000000000000000000000000000000000000000000000032']);
        return null;
      });

      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_subscribe');
        expect(params).toEqual(['newHeads']);

        setTimeout(() => {
          mockEthereumProvider.emit('notification', {
            subscription: '0x123',
            result: blockHeader,
          });
        }, 100);

        return '0x123';
      });

      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_getTransactionReceipt');
        expect(params).toEqual(['0x5550000000000000000000000000000000000000000000000000000000000032']);
        return txReceipt;
      });

      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_getCode');
        expect(params).toEqual([address2Lowercase, 'latest']);
        return '0x321';
      });

      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_unsubscribe');
        expect(params).toEqual(['0x123']);
        return '0x1';
      });

      const contract = new TestContract(eth);

      const sendTx = contract.deployBytecode('0x01234567', address, 200).send({
        from: address,
        gas: 50000,
        gasPrice: 3000,
      });

      const txHash = await sendTx.getTxHash();
      const receipt = await sendTx.getReceipt();

      expect(txHash).toBe('0x5550000000000000000000000000000000000000000000000000000000000032');
      expect(receipt.contractAddress).toEqual(address2);
    });

    it('should fail deployment if cannot retreive code', async () => {
      // eth_sendTransaction
      mockEthereumProvider.send.mockResolvedValueOnce(
        '0x5550000000000000000000000000000000000000000000000000000000000032',
      );

      // eth_getTransactionReceipt
      mockEthereumProvider.send.mockResolvedValueOnce(txReceipt);

      // eth_getCode
      mockEthereumProvider.send.mockResolvedValueOnce('0x');

      // eth_unsubscribe
      mockEthereumProvider.send.mockResolvedValueOnce('0x1');

      const contract = new TestContract(eth);

      const sendTx = contract.deployBytecode('0x01234567', address, 200).send({
        from: address,
        gas: 50000,
        gasPrice: 3000,
      });

      await expect(sendTx.getReceipt()).rejects.toThrowError('code could not be stored');
    });

    it('should fail deployment if no contract address in receipt', async () => {
      // eth_sendTransaction
      mockEthereumProvider.send.mockResolvedValueOnce(
        '0x5550000000000000000000000000000000000000000000000000000000000032',
      );

      // eth_getTransactionReceipt
      mockEthereumProvider.send.mockResolvedValueOnce({ ...txReceipt, contractAddress: undefined });

      // eth_unsubscribe
      mockEthereumProvider.send.mockResolvedValueOnce('0x1');

      const contract = new TestContract(eth);

      const sendTx = contract.deployBytecode('0x01234567', address, 200).send({
        from: address,
        gas: 50000,
        gasPrice: 3000,
      });

      await expect(sendTx.getReceipt()).rejects.toThrowError('contract address');
    });

    it('should deploy a contract with no ctor', async () => {
      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_sendTransaction');
        expect(params).toEqual([
          {
            data: '0x01234567',
            from: addressLowercase,
            gas: '0xc350',
            gasPrice: '0xbb8',
          },
        ]);
        return '0x5550000000000000000000000000000000000000000000000000000000000032';
      });

      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_getTransactionReceipt');
        expect(params).toEqual(['0x5550000000000000000000000000000000000000000000000000000000000032']);
        return txReceipt;
      });

      mockEthereumProvider.send.mockImplementationOnce(async (method, params) => {
        expect(method).toBe('eth_getCode');
        expect(params).toEqual([address2Lowercase, 'latest']);
        return '0x321';
      });

      const contract = new TestNoCtorContract(eth);

      const sendTx = contract.deploy().send({
        from: address,
        gas: 50000,
        gasPrice: 3000,
      });

      const txHash = await sendTx.getTxHash();
      const receipt = await sendTx.getReceipt();

      expect(txHash).toBe('0x5550000000000000000000000000000000000000000000000000000000000032');
      expect(receipt.contractAddress).toEqual(address2);
    });
  });
});
