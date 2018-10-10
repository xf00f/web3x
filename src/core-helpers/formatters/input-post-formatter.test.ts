import { inputPostFormatter } from './input-post-formatter';

describe('core-helpers', () => {
  describe('formatters', () => {
    describe('inputPostFormatter', () => {
      it('should return the correct value', () => {
        expect(
          inputPostFormatter({
            from: '0x00000',
            to: '0x00000',
            payload: '0x7b2274657374223a2274657374227d',
            ttl: 200,
            priority: 1000,
            topics: ['hello', 'mytopics'],
            workToProve: 1,
          })
        ).toEqual({
          from: '0x00000',
          to: '0x00000',
          payload: '0x7b2274657374223a2274657374227d',
          ttl: '0xc8',
          priority: '0x3e8',
          topics: ['0x68656c6c6f', '0x6d79746f70696373'],
          workToProve: '0x1',
        });
      });
    });
  });
});
