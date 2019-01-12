import { Eth } from 'web3x-es/eth';
import { fromWei } from 'web3x-es/utils';

export async function getBalance(eth: Eth, address: string) {
  const balance = await eth.getBalance(address);
  return fromWei(balance, 'ether');
}
