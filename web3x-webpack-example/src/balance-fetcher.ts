import { Address } from 'web3x-es/address';
import { Eth } from 'web3x-es/eth';
import { fromWei } from 'web3x-es/utils';

export async function getBalance(eth: Eth, address: Address) {
  const balance = await eth.getBalance(address);
  return fromWei(balance, 'ether');
}
