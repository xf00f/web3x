import { outputLogFormatter } from './output-log-formatter';

describe('core-helpers', function() {
  describe('formatters', function() {
    describe('outputLogFormatter', function() {
      it('should return the correct value', function() {
        expect(
          outputLogFormatter({
            transactionIndex: '0x3e8',
            logIndex: '0x3e8',
            blockNumber: '0x3e8',
            transactionHash: '0xd6960376d6c6dea93647383ffb245cfced97ccc5c7525397a543a72fdaea5265',
            blockHash: '0xd6960376d6c6dea93647383ffb245cfced97ccc5c7525397a543a72fdaea5265',
            data: '0x7b2274657374223a2274657374227',
            address: '0x11f4d0a3c12e86b4b5f39b213f7e19d048276dae', // lowercase address
            topics: ['0x68656c6c6f', '0x6d79746f70696373'],
          }),
        ).toEqual({
          transactionIndex: 1000,
          logIndex: 1000,
          blockNumber: 1000,
          transactionHash: '0xd6960376d6c6dea93647383ffb245cfced97ccc5c7525397a543a72fdaea5265',
          blockHash: '0xd6960376d6c6dea93647383ffb245cfced97ccc5c7525397a543a72fdaea5265',
          data: '0x7b2274657374223a2274657374227',
          topics: ['0x68656c6c6f', '0x6d79746f70696373'],
          address: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe', // checksum address
          id: 'log_2b801386',
        });
      });
      it('should return the correct value, when null values are present', function() {
        expect(
          outputLogFormatter({
            transactionIndex: null,
            logIndex: null,
            blockNumber: null,
            transactionHash: null,
            blockHash: null,
            data: '0x7b2274657374223a2274657374227',
            topics: ['0x68656c6c6f', '0x6d79746f70696373'],
            address: '0x11f4d0a3c12e86b4b5f39b213f7e19d048276dae', // lowercase address
          }),
        ).toEqual({
          transactionIndex: null,
          logIndex: null,
          blockNumber: null,
          transactionHash: null,
          blockHash: null,
          id: null,
          data: '0x7b2274657374223a2274657374227',
          topics: ['0x68656c6c6f', '0x6d79746f70696373'],
          address: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe', // checksum address
        });
      });
    });
  });
});
