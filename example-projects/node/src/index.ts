import { Web3 } from 'web3x';
import { sign, recover, fromWei } from 'web3x/utils';
import { Account, Wallet } from 'web3x/eth/accounts';
import { getBalance } from './balance-fetcher';
const abi = require('human-standard-token-abi');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const DAI_CONTRACT_ADDRESS = '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359';

async function main() {
  const web3 = new Web3('wss://mainnet.infura.io/ws');

  try {
    console.log(`Connected to network: ${await web3.eth.net.getNetworkType()}`);

    const balance = await getBalance(web3, ZERO_ADDRESS);
    console.log(`Balance of 0 address ETH: ${balance}`);

    const contract = new web3.eth.Contract(abi, DAI_CONTRACT_ADDRESS);
    const daiBalance = await contract.methods.balanceOf(ZERO_ADDRESS).call();
    console.log(`Balance of 0 address DAI: ${fromWei(daiBalance, 'ether')}`);

    const password = 'mypassword';
    const account = Account.create();
    const keystore = await account.encrypt(password);
    const decryptedAccount = await Account.fromKeystore(keystore, password);

    const wallet = new Wallet();
    wallet.add(decryptedAccount);
    wallet.create(2);

    const encryptedWallet = await wallet.encrypt(password);
    const decryptedWallet = await Wallet.fromKeystores(encryptedWallet, password);

    console.log(`Decrypted wallet has ${decryptedWallet.length} accounts.`);
    const signingAccount = decryptedWallet.get(2)!;

    console.log(`Signing message with address: ${signingAccount.address}`);

    const msg = 'My signed text';
    const sig = sign(msg, signingAccount.privateKey);
    const address = recover(msg, sig.signature);

    if (address === signingAccount.address) {
      console.log(`Message was signed by: ${address}`);
    } else {
      console.error('Incorrect signature for message.');
    }
  } finally {
    web3.close();
  }
}

main().catch(console.error);
