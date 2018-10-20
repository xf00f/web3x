import { getBalance } from './balance-fetcher';

describe('test suite', () => {
  let mockEth: any;

  beforeEach(() => {
    mockEth = {
      getBalance: jest.fn(),
    };
  });

  it('should fetch balance', async () => {
    mockEth.getBalance.mockResolvedValue('1000000000000000000');

    const balance = await getBalance(mockEth, '0x0000000000000000000000000000000000000000');

    expect(balance).toBe('1');
    expect(mockEth.getBalance).toHaveBeenCalledWith('0x0000000000000000000000000000000000000000');
  });
});
