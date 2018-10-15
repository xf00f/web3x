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

import { Contract } from '.';
import { abi } from './fixtures/abi';
import { MockRequestManager } from '../request-manager/mock-request-manager';
import { sha3 } from '../utils';
import { Eth } from '../eth/eth';

const address = '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe';
const addressLowercase = '0x11f4d0a3c12e86b4b5f39b213f7e19d048276dae';
const address2 = '0x5555567890123456789012345678901234567891';

describe('contract', function() {
  const account = {
    address: '0xEB014f8c8B418Db6b45774c326A0E64C78914dC0',
    privateKey: '0xbe6383dad004f233317e46ddb46ad31b16064d14447a95cc1d8c8d4bc61c3728',
  };

  let eth: Eth;
  let mockRequestManager: MockRequestManager;

  beforeEach(() => {
    mockRequestManager = new MockRequestManager();
    eth = new Eth(mockRequestManager);
  });

  describe('instantiation', function() {
    it('should transform address from checksum addressess', function() {
      const contract = new Contract(eth, abi, address);
      expect(contract.address).toBe(address);
    });

    it('should transform address to checksum address', function() {
      const contract = new Contract(eth, abi, address);
      expect(contract.address).toBe(address);
    });

    it('should fail on invalid address', function() {
      const test = () => new Contract(eth, abi, '0x11F4D0A3c12e86B4b5F39B213F7E19D048276DAe');
      expect(test).toThrow();
    });

    it('should fail on invalid address as options.from', function() {
      var test = () =>
        new Contract(eth, abi, address, {
          from: '0x11F4D0A3c12e86B4b5F39B213F7E19D048276DAe',
        });
      expect(test).toThrow();
    });
  });

  describe('event', function() {
    const signature = 'Changed(address,uint256,uint256,uint256)';

    function emitData(delayMs: number = 0, extend?: object) {
      setTimeout(() => {
        mockRequestManager.provider.emit('0x123', null, {
          address: addressLowercase,
          topics: [
            sha3(signature),
            '0x000000000000000000000000' + addressLowercase.replace('0x', ''),
            '0x0000000000000000000000000000000000000000000000000000000000000001',
          ],
          blockNumber: '0x3',
          transactionHash: '0x1234',
          blockHash: '0x1345',
          logIndex: '0x4',
          data:
            '0x0000000000000000000000000000000000000000000000000000000000000001' +
            '0000000000000000000000000000000000000000000000000000000000000008',
          ...extend,
        });
      }, delayMs);
    }

    function mockEthSubscribe() {
      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_subscribe');
        expect(payload.params[1]).toEqual({
          topics: [sha3(signature), '0x000000000000000000000000' + addressLowercase.replace('0x', ''), null],
          address: addressLowercase,
        });

        emitData(10);

        return '0x123';
      });
    }

    it('should create event subscription', function(done) {
      mockEthSubscribe();

      const contract = new Contract(eth, abi, address);

      contract.events.Changed({ filter: { from: address } }, function(err, result, sub) {
        expect(result.returnValues.from).toBe(address);
        expect(result.returnValues.amount).toBe('1');
        expect(result.returnValues.t1).toBe('1');
        expect(result.returnValues.t2).toBe('8');

        done();
      });
    });

    it('should create event from the events object using a signature and callback', function(done) {
      mockEthSubscribe();

      const contract = new Contract(eth, abi, address);

      var event = contract.events['0x792991ed5ba9322deaef76cff5051ce4bedaaa4d097585970f9ad8f09f54e651'](
        { filter: { from: address } },
        function(err, result) {
          expect(result.returnValues.from).toBe(address);
          expect(result.returnValues.amount).toBe('1');
          expect(result.returnValues.t1).toBe('1');
          expect(result.returnValues.t2).toBe('8');

          event.unsubscribe();
          done();
        },
      );
    });

    it('should create event from the events object using event name and parameters', function(done) {
      mockEthSubscribe();

      const contract = new Contract(eth, abi, address);

      var event = contract.events[signature]({ filter: { from: address } }, function(err, result) {
        expect(result.returnValues.from).toBe(address);
        expect(result.returnValues.amount).toBe('1');
        expect(result.returnValues.t1).toBe('1');
        expect(result.returnValues.t2).toBe('8');

        event.unsubscribe();
        done();
      });
    });

    it('should create event from the events object and use the fromBlock option', function(done) {
      mockRequestManager.send.mockResolvedValueOnce([
        {
          address: addressLowercase,
          topics: [
            sha3(signature),
            '0x000000000000000000000000' + addressLowercase.replace('0x', ''),
            '0x0000000000000000000000000000000000000000000000000000000000000002',
          ],
          blockNumber: '0x3',
          transactionHash: '0x1234',
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
          blockHash: '0x1346',
          logIndex: '0x1',
          data:
            '0x0000000000000000000000000000000000000000000000000000000000000004' +
            '0000000000000000000000000000000000000000000000000000000000000005',
        },
      ]);

      mockEthSubscribe();

      const contract = new Contract(eth, abi, address);
      let count = 0;

      let event = contract.events.Changed({ fromBlock: 0, filter: { from: address } }).on('data', result => {
        count++;

        if (count === 1) {
          expect(result.returnValues.from).toBe(address);
          expect(result.returnValues.amount).toBe('2');
          expect(result.returnValues.t1).toBe('2');
          expect(result.returnValues.t2).toBe('9');
        }
        if (count === 2) {
          expect(result.returnValues.from).toBe(address);
          expect(result.returnValues.amount).toBe('3');
          expect(result.returnValues.t1).toBe('4');
          expect(result.returnValues.t2).toBe('5');
        }
        if (count === 3) {
          expect(result.returnValues.from).toBe(address);
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

      const contract = new Contract(eth, abi, address);

      await new Promise(resolve => {
        contract.once('Changed', { filter: { from: address } }, function(err, result, sub) {
          count++;
          resolve();
        });
      });

      // Emit a second.
      mockRequestManager.provider.emit('0x123', null, {
        blockHash: '0x1345',
      });

      expect(count).toBe(1);
    });

    it('should create event subscription and fire the changed event, if log.removed = true', function(done) {
      mockEthSubscribe();
      emitData(200, { removed: true });

      let count = 1;
      const contract = new Contract(eth, abi, address);

      contract.events
        .Changed({ filter: { from: address } })
        .on('data', function(result) {
          expect(count).toBe(1);
          count++;
        })
        .on('changed', function(result) {
          expect(result.removed).toBe(true);
          expect(count).toBe(2);
          done();
        });
    });

    it('should create all event filter and receive two logs', function(done) {
      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_subscribe');
        expect(payload.params[1]).toEqual({
          topics: [],
          address: addressLowercase,
        });

        emitData(100);
        emitData(200, {
          topics: [
            sha3('Unchanged(uint256,address,uint256)'),
            '0x0000000000000000000000000000000000000000000000000000000000000002',
            '0x000000000000000000000000' + address.replace('0x', ''),
          ],
          data: '0x0000000000000000000000000000000000000000000000000000000000000005',
        });

        return '0x123';
      });

      const contract = new Contract(eth, abi, address);

      let count = 0;
      let event = contract.events.allEvents({}, function(_, result) {
        count++;

        if (count === 1) {
          expect(result.returnValues.from).toBe(address);
          expect(result.returnValues.amount).toBe('1');
          expect(result.returnValues.t1).toBe('1');
          expect(result.returnValues.t2).toBe('8');
        }
        if (count === 2) {
          expect(result.returnValues.addressFrom).toBe(address);
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

    it('should encode a function call', function() {
      const contract = new Contract(eth, abi, address);

      const result = contract.methods.balance(address).encodeABI();

      expect(result).toBe(
        sha3(signature).slice(0, 10) + '000000000000000000000000' + addressLowercase.replace('0x', ''),
      );
    });

    it('should encode a constructor call with data', function() {
      const contract = new Contract(eth, abi, address);

      var result = contract.deploy('0x1234', address, 10).encodeABI();

      expect(result).toBe(
        '0x1234' +
          '000000000000000000000000' +
          addressLowercase.replace('0x', '') +
          '000000000000000000000000000000000000000000000000000000000000000a',
      );
    });

    it('should estimate a function', async () => {
      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_estimateGas');
        expect(payload.params).toEqual([
          {
            data: sha3(signature).slice(0, 10) + '000000000000000000000000' + addressLowercase.replace('0x', ''),
            to: addressLowercase,
          },
        ]);
        return '0x0000000000000000000000000000000000000000000000000000000000000032';
      });

      const contract = new Contract(eth, abi, address);

      const res = await contract.methods.balance(address).estimateGas();
      expect(res).toBe(50);
    });

    it('should estimate the constructor', async () => {
      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_estimateGas');
        expect(payload.params).toEqual([
          {
            data:
              '0x1234000000000000000000000000' +
              addressLowercase.replace('0x', '') +
              '0000000000000000000000000000000000000000000000000000000000000032',
          },
        ]);
        return '0x000000000000000000000000000000000000000000000000000000000000000a';
      });

      const contract = new Contract(eth, abi, address);

      const res = await contract.deploy('0x1234', address, 50).estimateGas();
      expect(res).toBe(10);
    });

    it('should send with many parameters', async () => {
      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_call');
        expect(payload.params).toEqual([
          {
            data:
              '0x8708f4a12454534500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000c30786666323435343533343500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004ff24545345000000000000000000000000000000000000000000000000000000534500000000000000000000000000000000000000000000000000000000000045450000000000000000000000000000000000000000000000000000000000004533450000000000000000000000000000000000000000000000000000000000',
            to: addressLowercase,
          },
          'latest',
        ]);
        return '0x000000000000000000000000' + addressLowercase.replace('0x', '');
      });

      const contract = new Contract(eth, abi, address);

      const res = await contract.methods
        .hasALotOfParams('0x24545345', '0xff24545345', ['0xff24545345', '0x5345', '0x4545', '0x453345'])
        .call();
      expect(res).toBe(address);
    });

    it('should send overload functions with zero parameters', async () => {
      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_call');
        expect(payload.params).toEqual([
          {
            data: '0xbb853481',
            to: addressLowercase,
          },
          'latest',
        ]);
        return '0x0000000000000000000000000000000000000000000000000000000000000005';
      });

      const contract = new Contract(eth, abi, address);
      const res = await contract.methods.overloadedFunction().call();
      expect(res).toBe('5');
    });

    it('should send overload functions with one parameters', async () => {
      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_call');
        expect(payload.params).toEqual([
          {
            data: '0x533678270000000000000000000000000000000000000000000000000000000000000006',
            to: addressLowercase,
          },
          'latest',
        ]);
        return '0x0000000000000000000000000000000000000000000000000000000000000006';
      });

      const contract = new Contract(eth, abi, address);

      const res = await contract.methods.overloadedFunction(6).call();
      expect(res).toBe('6');
    });

    it('should call constant function', async () => {
      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_call');
        expect(payload.params).toEqual([
          {
            data: sha3(signature).slice(0, 10) + '000000000000000000000000' + addressLowercase.replace('0x', ''),
            to: addressLowercase,
          },
          'latest',
        ]);
        return '0x0000000000000000000000000000000000000000000000000000000000000032';
      });

      const contract = new Contract(eth, abi, address);

      const res = await contract.methods.balance(address).call();
      expect(res).toBe('50');
    });

    it('should call constant function with default block', async () => {
      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_call');
        expect(payload.params).toEqual([
          {
            data: sha3(signature).slice(0, 10) + '000000000000000000000000' + addressLowercase.replace('0x', ''),
            to: addressLowercase,
          },
          '0xb',
        ]);
        return '0x0000000000000000000000000000000000000000000000000000000000000032';
      });

      const contract = new Contract(eth, abi, address);

      const res = await contract.methods.balance(address).call({}, 11);
      expect(res).toBe('50');
    });

    it('should call constant concurrently', async () => {
      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_call');
        expect(payload.params).toEqual([
          {
            data:
              sha3('balance(address)').slice(0, 10) + '000000000000000000000000' + addressLowercase.replace('0x', ''),
            to: addressLowercase,
          },
          'latest',
        ]);
        return '0x000000000000000000000000000000000000000000000000000000000000000a';
      });

      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_call');
        expect(payload.params).toEqual([
          {
            data: sha3('owner()').slice(0, 10),
            to: addressLowercase,
          },
          'latest',
        ]);
        return '0x00000000000000000000000011f4d0a3c12e86b4b5f39b213f7e19d048276dae';
      });

      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_call');
        expect(payload.params).toEqual([
          {
            data: sha3('getStr()').slice(0, 10),
            to: addressLowercase,
          },
          'latest',
        ]);
        return '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000848656c6c6f212521000000000000000000000000000000000000000000000000';
      });

      const contract = new Contract(eth, abi, address);

      const [m1, m2, m3] = await Promise.all([
        contract.methods.balance(address).call(),
        contract.methods.owner().call(),
        contract.methods.getStr().call(),
      ]);

      expect(m1).toBe('10');
      expect(m2).toBe('0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe');
      expect(m3).toBe('Hello!%!');
    });

    it('should return an error when returned string is 0x', async () => {
      const signature = 'getStr()';

      const contract = new Contract(eth, abi, address);

      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_call');
        expect(payload.params).toEqual([
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

      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_call');
        expect(payload.params).toEqual([
          {
            data: sha3(signature).slice(0, 10),
            to: addressLowercase,
            from: address2,
          },
          'latest',
        ]);
        return '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000';
      });

      const contract = new Contract(eth, abi, address);

      const result = await contract.methods.getStr().call({ from: address2 });
      expect(result).toBe('');
    });
  });

  describe('send', () => {
    const signature = sha3('mySend(address,uint256)').slice(0, 10);

    it('should sendTransaction and check for receipts with formatted logs', function(done) {
      // eth_sendTransaction
      mockRequestManager.send.mockResolvedValueOnce(
        '0x1234000000000000000000000000000000000000000000000000000000056789',
      );

      // eth_getTransactionReceipt
      mockRequestManager.send.mockResolvedValueOnce({
        contractAddress: null,
        cumulativeGasUsed: '0xa',
        transactionIndex: '0x3',
        transactionHash: '0x1234',
        blockNumber: '0xa',
        blockHash: '0x1234',
        gasUsed: '0x0',
        logs: [
          {
            address: address,
            topics: [
              sha3('Unchanged(uint256,address,uint256)'),
              '0x0000000000000000000000000000000000000000000000000000000000000002',
              '0x000000000000000000000000' + addressLowercase.replace('0x', ''),
            ],
            blockNumber: '0xa',
            transactionHash: '0x1234',
            transactionIndex: '0x0',
            blockHash: '0x1345',
            logIndex: '0x4',
            data: '0x0000000000000000000000000000000000000000000000000000000000000005',
          },
          {
            address: address,
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
        ],
      });

      const contract = new Contract(eth, abi, address);

      contract.methods
        .mySend(address, 10)
        .send({ from: address2, gasPrice: '21345678654321' })
        .on('receipt', function(receipt) {
          expect(receipt).toEqual({
            contractAddress: null,
            cumulativeGasUsed: 10,
            transactionIndex: 3,
            transactionHash: '0x1234',
            blockNumber: 10,
            blockHash: '0x1234',
            gasUsed: 0,
            events: {
              Unchanged: {
                address: address,
                blockNumber: 10,
                transactionHash: '0x1234',
                blockHash: '0x1345',
                logIndex: 4,
                id: 'log_9ff24cb4',
                transactionIndex: 0,
                returnValues: {
                  0: '2',
                  1: address,
                  2: '5',
                  value: '2',
                  addressFrom: address,
                  t1: '5',
                },
                event: 'Unchanged',
                signature: '0xf359668f205d0b5cfdc20d11353e05f633f83322e96f15486cbb007d210d66e5',
                raw: {
                  topics: [
                    '0xf359668f205d0b5cfdc20d11353e05f633f83322e96f15486cbb007d210d66e5',
                    '0x0000000000000000000000000000000000000000000000000000000000000002',
                    '0x000000000000000000000000' + addressLowercase.replace('0x', ''),
                  ],
                  data: '0x0000000000000000000000000000000000000000000000000000000000000005',
                },
              },
              Changed: {
                address: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
                blockNumber: 10,
                transactionHash: '0x1234',
                blockHash: '0x1345',
                logIndex: 4,
                id: 'log_9ff24cb4',
                transactionIndex: 0,
                returnValues: {
                  0: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
                  1: '1',
                  2: '1',
                  3: '8',
                  from: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
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
            },
          });

          done();
        });
    });

    it('should sendTransaction and check for receipts with formatted logs when multiple of same event', function(done) {
      mockRequestManager.send.mockResolvedValueOnce(
        '0x1234000000000000000000000000000000000000000000000000000000056789',
      );

      mockRequestManager.send.mockResolvedValueOnce({
        contractAddress: null,
        cumulativeGasUsed: '0xa',
        transactionIndex: '0x3',
        transactionHash: '0x1234',
        blockNumber: '0xa',
        blockHash: '0x1234',
        gasUsed: '0x0',
        logs: [
          {
            address: address,
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
            address: address,
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

      const contract = new Contract(eth, abi, address);

      contract.methods
        .mySend(address, 10)
        .send({ from: address2, gasPrice: '21345678654321' })
        .on('receipt', function(receipt) {
          // wont throw if it errors ?! nope: causes a timeout
          expect(receipt).toEqual({
            contractAddress: null,
            cumulativeGasUsed: 10,
            transactionIndex: 3,
            transactionHash: '0x1234',
            blockNumber: 10,
            blockHash: '0x1234',
            gasUsed: 0,
            events: {
              Changed: [
                {
                  address: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
                  blockNumber: 10,
                  transactionHash: '0x1234',
                  blockHash: '0x1345',
                  logIndex: 4,
                  id: 'log_9ff24cb4',
                  transactionIndex: 0,
                  returnValues: {
                    0: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
                    1: '1',
                    2: '1',
                    3: '8',
                    from: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
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
                  address: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
                  blockNumber: 10,
                  transactionHash: '0x1234',
                  blockHash: '0x1345',
                  logIndex: 5,
                  id: 'log_8b8a2b7f',
                  transactionIndex: 0,
                  returnValues: {
                    0: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
                    1: '2',
                    2: '1',
                    3: '8',
                    from: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
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
            },
          });

          done();
        });
    });

    it('should sendTransaction and receive multiple confirmations', function(done) {
      // eth_sendTransaction
      mockRequestManager.send.mockResolvedValueOnce(
        '0x1234000000000000000000000000000000000000000000000000000000056789',
      );

      // eth_getTransactionReceipt
      mockRequestManager.send.mockResolvedValueOnce({
        contractAddress: null,
        cumulativeGasUsed: '0xa',
        transactionIndex: '0x3',
        transactionHash: '0x1234',
        blockNumber: '0xa',
        blockHash: '0x1234',
        gasUsed: '0x0',
        logs: [],
      });

      // eth_subscribe
      mockRequestManager.send.mockResolvedValueOnce('0x123');

      setTimeout(() => {
        mockRequestManager.provider.emit('0x123', null, {
          blockNumber: '0x10',
        });
      }, 100);

      setTimeout(() => {
        mockRequestManager.provider.emit('0x123', null, {
          blockNumber: '0x11',
        });
      }, 200);

      const contract = new Contract(eth, abi, address);

      var count = 0;
      contract.methods
        .mySend(address, 10)
        .send({ from: address2, gasPrice: '21345678654321' })
        .on('confirmation', function(confirmationNumber, receipt) {
          count++;
          if (count === 1) {
            expect(receipt).toEqual({
              contractAddress: null,
              cumulativeGasUsed: 10,
              transactionIndex: 3,
              transactionHash: '0x1234',
              blockNumber: 10,
              blockHash: '0x1234',
              gasUsed: 0,
              events: {},
            });

            expect(confirmationNumber).toBe(0);
          }
          if (count === 2) {
            expect(receipt).toEqual({
              contractAddress: null,
              cumulativeGasUsed: 10,
              transactionIndex: 3,
              transactionHash: '0x1234',
              blockNumber: 10,
              blockHash: '0x1234',
              gasUsed: 0,
              events: {},
            });

            expect(confirmationNumber).toBe(1);
            done();
          }
        })
        .on('error', done);
    });

    it('should sendTransaction to contract function', async () => {
      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_sendTransaction');
        expect(payload.params).toEqual([
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
      mockRequestManager.send.mockResolvedValueOnce({
        blockHash: '0x1234',
      });

      const contract = new Contract(eth, abi, address);

      await contract.methods.mySend(address, 17).send({ from: address, gasPrice: '234564321234' });
    });

    it('should throw error when trying to send ether to a non payable contract function', async () => {
      const contract = new Contract(eth, abi, address);

      await expect(
        contract.methods.myDisallowedSend(address, 17).send({ from: address, value: 123 }),
      ).rejects.toThrowError(/non-payable/);
    });

    it('should not throw error when trying to not send ether to a non payable contract function', async () => {
      const signature = 'myDisallowedSend(address,uint256)';

      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_sendTransaction');
        expect(payload.params).toEqual([
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

      mockRequestManager.send.mockResolvedValueOnce({
        contractAddress: null,
        cumulativeGasUsed: '0xa',
        transactionIndex: '0x3',
        transactionHash: '0x1234',
        blockNumber: '0xa',
        blockHash: '0x1234',
        gasUsed: '0x0',
        logs: [],
      });

      const contract = new Contract(eth, abi, address);

      await contract.methods.myDisallowedSend(address, 17).send({ from: address, gasPrice: '23456787654321' });
    });

    it('should sendTransaction to contract function using the function name incl. parameters', async () => {
      // eth_sendTransaction
      mockRequestManager.send.mockResolvedValueOnce(
        '0x1234000000000000000000000000000000000000000000000000000000056789',
      );

      // eth_getTransactionReceipt
      mockRequestManager.send.mockResolvedValueOnce({
        blockHash: '0x1234',
      });

      const contract = new Contract(eth, abi, address);

      await contract.methods['mySend(address,uint256)'](address, 17).send({
        from: address,
        gasPrice: '23456787654321',
      });

      expect(mockRequestManager.send).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'eth_sendTransaction',
          params: [
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
          ],
        }),
      );
    });

    it('should sendTransaction to contract function using the signature', async () => {
      // eth_sendTransaction
      mockRequestManager.send.mockResolvedValueOnce(
        '0x1234000000000000000000000000000000000000000000000000000000056789',
      );

      // eth_getTransactionReceipt
      mockRequestManager.send.mockResolvedValueOnce({
        blockHash: '0x1234',
      });

      const contract = new Contract(eth, abi, address);

      await contract.methods[signature](address, 17).send({ from: address, gasPrice: '1230000000' });

      expect(mockRequestManager.send).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'eth_sendTransaction',
          params: [
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
          ],
        }),
      );
    });

    it('should throw when trying to create a tx object and wrong amount of params', () => {
      const contract = new Contract(eth, abi, address);
      expect(() => contract.methods.mySend(address)).toThrowError(/Invalid number of parameters/);
    });

    it('should make a call with optional params', function(done) {
      const signature = 'balance(address)';
      let count = 0;

      mockRequestManager.send.mockImplementationOnce(async payload => {
        count++;
        if (count > 1) return;

        expect(payload.method).toBe('eth_call');
        expect(payload.params).toEqual([
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

      const contract = new Contract(eth, abi, address);

      contract.methods
        .balance(address)
        .call({ from: address, gas: 50000 })
        .then(function(r) {
          expect(r).toBe('50');
          done();
        });
    });

    it('should explicitly make a call with optional params', function(done) {
      const signature = 'balance(address)';

      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_call');
        expect(payload.params).toEqual([
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

      const contract = new Contract(eth, abi, address);

      contract.methods
        .balance(address)
        .call({ from: address, gas: 50000 })
        .then(function(r) {
          expect(r).toBe('50');
          done();
        });
    });

    it('should explicitly make a call with optional params and defaultBlock', function(done) {
      let signature = 'balance(address)';

      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_call');
        expect(payload.params).toEqual([
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

      const contract = new Contract(eth, abi, address);

      contract.methods
        .balance(address)
        .call({ from: address, gas: 50000 }, 11)
        .then(function(r) {
          expect(r).toBe('50');
          done();
        });
    });

    it('should sendTransaction with optional params', async () => {
      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_sendTransaction');
        expect(payload.params).toEqual([
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
      mockRequestManager.send.mockResolvedValueOnce({
        blockHash: '0x1234',
      });

      const contract = new Contract(eth, abi, address);

      await contract.methods.mySend(address, 17).send({ from: address, gas: 50000, gasPrice: 3000, value: 10000 });
    });

    it('should sendTransaction and fill in default gasPrice', async () => {
      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_gasPrice');
        return '0x45656456456456';
      });

      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_sendTransaction');
        expect(payload.params).toEqual([
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
      mockRequestManager.send.mockResolvedValueOnce({
        blockHash: '0x1234',
      });

      const contract = new Contract(eth, abi, address);

      await contract.methods.mySend(address, 17).send({ from: address });
    });

    it('should explicitly sendTransaction with optional params', async () => {
      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_sendTransaction');
        expect(payload.params).toEqual([
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
      mockRequestManager.send.mockResolvedValueOnce({
        blockHash: '0x1234',
      });

      const contract = new Contract(eth, abi, address);

      await contract.methods.mySend(address, 17).send({ from: address, gas: 50000, gasPrice: 3000, value: 10000 });
    });

    it('should explicitly estimateGas with optional params', async () => {
      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_estimateGas');
        expect(payload.params).toEqual([
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
      mockRequestManager.send.mockResolvedValueOnce({
        blockHash: '0x1234',
      });

      const contract = new Contract(eth, abi, address);

      await contract.methods
        .mySend(address, 17)
        .estimateGas({ from: address, gas: 50000, gasPrice: 3000, value: 10000 });
    });

    it('getPastEvents should get past events and format them correctly', async () => {
      //const signature = 'testArr(int[])';
      const signature = 'Changed(address,uint256,uint256,uint256)';

      const topic1 = [
        sha3(signature),
        '0x000000000000000000000000' + address.replace('0x', ''),
        '0x000000000000000000000000000000000000000000000000000000000000000a',
      ];
      const topic2 = [
        sha3(signature),
        '0x000000000000000000000000' + address.replace('0x', ''),
        '0x0000000000000000000000000000000000000000000000000000000000000003',
      ];

      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_getLogs');
        expect(payload.params).toEqual([
          {
            address: addressLowercase,
            topics: [
              '0x792991ed5ba9322deaef76cff5051ce4bedaaa4d097585970f9ad8f09f54e651',
              '0x000000000000000000000000' + address2.replace('0x', ''),
              null,
            ],
          },
        ]);

        return [
          {
            address: address,
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
            address: address,
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

      const contract = new Contract(eth, abi, address);

      const result = await contract.getPastEvents('Changed', { filter: { from: address2 } });

      expect(result).toEqual([
        {
          event: 'Changed',
          signature: '0x792991ed5ba9322deaef76cff5051ce4bedaaa4d097585970f9ad8f09f54e651',
          id: 'log_9ff24cb4',
          address: address,
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
          address: address,
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

    it('should call testArr method and properly parse result', function(done) {
      const signature = 'testArr(int[])';

      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_call');
        expect(payload.params).toEqual([
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
      mockRequestManager.send.mockResolvedValueOnce({
        blockHash: '0x1234',
      });

      const contract = new Contract(eth, abi, address);

      contract.methods
        .testArr([3])
        .call()
        .then(function(result) {
          expect(result).toBe('5');
          done();
        });
    });

    it('should call owner method, properly', async () => {
      const signature = 'owner()';

      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_call');
        expect(payload.params).toEqual([
          {
            data: sha3(signature).slice(0, 10),
            to: addressLowercase,
          },
          'latest',
        ]);
        return '0x000000000000000000000000' + addressLowercase.replace('0x', '');
      });

      // eth_getTransactionReceipt
      mockRequestManager.send.mockResolvedValueOnce({
        blockHash: '0x1234',
      });

      const contract = new Contract(eth, abi, address);

      const result = await contract.methods.owner().call();
      expect(result).toBe(address);
    });

    it('should decode an struct correctly', function(done) {
      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_call');
        expect(payload.params).toEqual([
          {
            data: '0x2a4aedd50000000000000000000000009cc9a2c777605af16872e0997b3aeb91d96d5d8c',
            to: addressLowercase,
          },
          'latest',
        ]);
        return '0x0000000000000000000000000000000000000000000000000000000000000001';
      });

      const contract = new Contract(eth, abi, address);

      contract.methods
        .listOfNestedStructs('0x9CC9a2c777605Af16872E0997b3Aeb91d96D5D8c')
        .call()
        .then(function(result) {
          var expectedArray: boolean[] = [];
          expectedArray[0] = true;
          expectedArray['status'] = true;

          expect(result).toEqual(expectedArray);
          done();
        });
    });

    it('should call an contract method with an struct as parameter', async () => {
      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_sendTransaction');
        expect(payload.params).toEqual([
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
      mockRequestManager.send.mockResolvedValueOnce({
        blockHash: '0x1234',
      });

      const contract = new Contract(eth, abi, address);

      await contract.methods.addStruct({ status: true }).send({
        from: address,
        gas: 50000,
        gasPrice: 3000,
      });
    });
  });

  describe('deploy', function() {
    it('should deploy a contract and use all promise steps', function(done) {
      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_sendTransaction');
        expect(payload.params).toEqual([
          {
            data:
              '0x1234567000000000000000000000000' +
              addressLowercase.replace('0x', '') +
              '00000000000000000000000000000000000000000000000000000000000000c8',
            from: addressLowercase,
            gas: '0xc350',
            gasPrice: '0xbb8',
          },
        ]);
        return '0x5550000000000000000000000000000000000000000000000000000000000032';
      });

      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_getTransactionReceipt');
        expect(payload.params).toEqual(['0x5550000000000000000000000000000000000000000000000000000000000032']);
        return null;
      });

      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_subscribe');
        expect(payload.params).toEqual(['newHeads']);

        setTimeout(() => {
          mockRequestManager.provider.emit('0x123', null, {
            blockNumber: '0x10',
          });
        }, 100);

        return '0x123';
      });

      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_getTransactionReceipt');
        expect(payload.params).toEqual(['0x5550000000000000000000000000000000000000000000000000000000000032']);
        return {
          contractAddress: addressLowercase,
          blockHash: '0xffdd',
        };
      });

      mockRequestManager.send.mockImplementationOnce(async payload => {
        expect(payload.method).toBe('eth_getCode');
        expect(payload.params).toEqual([addressLowercase, 'latest']);
        return '0x321';
      });

      const contract = new Contract(eth, abi);

      contract
        .deploy('0x1234567', address, 200)
        .send({
          from: address,
          gas: 50000,
          gasPrice: 3000,
        })
        .on('transactionHash', value => {
          expect('0x5550000000000000000000000000000000000000000000000000000000000032').toBe(value);
        })
        .on('receipt', receipt => {
          expect(address).toBe(receipt.contractAddress);
          expect(contract.address).toBeUndefined();
        })
        .then(contract => {
          expect(contract.address).toBe(address);
          done();
        });
    });
  });
});
