import { getBalance } from './balance-fetcher';
import { Address } from 'web3x-es/address';

describe('test suite', () => {
  let mockEth: any;

  beforeEach(() => {
    mockEth = {
      getBalance: jest.fn(),
    };
  });

  it('should fetch balance', async () => {
    mockEth.getBalance.mockResolvedValue('1000000000000000000');

    const balance = await getBalance(mockEth, Address.ZERO);

    expect(balance).toBe('1');
    expect(mockEth.getBalance).toHaveBeenCalledWith(Address.ZERO);
  });
});
