import { getBalance } from './balance-fetcher';

describe('test suite', () => {
  let mockWeb3: any;

  beforeEach(() => {
    mockWeb3 = {
      eth: {
        getBalance: jest.fn(),
      },
    };
  });

  it('should fetch balance', async () => {
    mockWeb3.eth.getBalance.mockResolvedValue('1000000000000000000');

    const balance = await getBalance(mockWeb3, '0x0000000000000000000000000000000000000000');

    expect(balance).toBe('1');
    expect(mockWeb3.eth.getBalance).toHaveBeenCalledWith('0x0000000000000000000000000000000000000000');
  });
});
