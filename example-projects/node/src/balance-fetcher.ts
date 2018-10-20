import { fromWei } from 'web3x/utils';
import { Eth } from 'web3x/eth';

export async function getBalance(eth: Eth, address: string) {
  const balance = await eth.getBalance(address);
  return fromWei(balance, 'ether');
}
