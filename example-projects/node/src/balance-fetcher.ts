import { Web3 } from 'web3.ts';
import { fromWei } from 'web3.ts/dest/utils';

export async function getBalance(web3: Web3, address: string) {
  const balance = await web3.eth.getBalance(address);
  return fromWei(balance, 'ether');
}
