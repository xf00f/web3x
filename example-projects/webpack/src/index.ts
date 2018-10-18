import { WebsocketProvider } from 'web3x-es/providers';
import { Eth } from 'web3x-es/eth';
import { fromWei } from 'web3x-es/utils';
import { Wallet } from 'web3x-es/accounts';
import { Contract } from 'web3x-es/contract';
import { toWei } from '../../../dest/utils';
import { TransactionReceipt } from 'web3x-es/formatters';

const abi = require('human-standard-token-abi');
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const DAI_CONTRACT_ADDRESS = '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359';

/*
  Demonstrates how to create a minimally sized build. If you only need to provide access to Ethereum calls over a
  websocket connection, with no local accounts (e.g. interfacing with Metamask or a remote node with accounts),
  then it makes no sense to bundle all the crypto/additional provider/accounts code with your app. Construct only
  the components you need and keep things lean.

  Notice as we use increasingly large amounts of the library, the size of build increases.
*/
async function main() {
  // Minimal code for getting a balance.
  // Webpack output: ~119kb
  const provider = new WebsocketProvider('wss://mainnet.infura.io/ws');
  const eth = Eth.fromProvider(provider);
  const balance = await eth.getBalance('0x0000000000000000000000000000000000000000');
  document.body.innerText = `Balance of 0 address ETH: ${fromWei(balance, 'ether')}`;

  // Assuming you want some local accounts to work with, construct them yourself.
  // Webpack output: ~293kb
  const wallet = new Wallet(eth);
  const [fromAccount, toAccount] = wallet.create(2);

  // When using the library in this way Eth object has no knowledge of local accounts. Be sure
  // to use account function to send a transaction.
  await fromAccount
    .sendTransaction({ value: toWei(1, 'ether') as string, to: toAccount.address })
    .on(
      'receipt',
      (receipt: TransactionReceipt) =>
        (document.body.innerText += `Transaction complete for ${receipt.transactionHash}.`)
    );

  // Work with a contract, using one of our own local accounts as a default 'from' address.
  // Webpack output: ~333kb
  const contract = new Contract(eth, abi, DAI_CONTRACT_ADDRESS, { from: fromAccount.address }, wallet);
  const daiBalance = await contract.methods.balanceOf(ZERO_ADDRESS).call();
  document.body.innerText += `Balance of 0 address DAI: ${fromWei(daiBalance, 'ether')}`;

  provider.disconnect();
}

main().catch(console.error);
