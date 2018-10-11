import { Web3 } from 'web3x-es';
import { getBalance } from './balance-fetcher';

async function main() {
  const web3 = new Web3('wss://mainnet.infura.io/ws');
  const balance = await getBalance(web3, '0x0000000000000000000000000000000000000000');
  document.body.innerText = `Balance of 0 address ETH: ${balance}`;
  web3.close();
}

main().catch(console.error);
