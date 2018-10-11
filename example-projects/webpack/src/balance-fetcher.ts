import { Web3 } from 'web3x-es';
import { fromWei } from 'web3x-es/utils';

export async function getBalance(web3: Web3, address: string) {
  const balance = await web3.eth.getBalance(address);
  return fromWei(balance, 'ether');
}
