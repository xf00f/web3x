import { sign, recover, fromWei } from 'web3x/utils';
import { Account, Wallet } from 'web3x/accounts';
import { getBalance } from './balance-fetcher';
import { WebsocketProvider } from 'web3x/providers';
import { Net } from 'web3x/net';
import { Eth } from 'web3x/eth';
import { DaiContract } from './contracts/DaiContract';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const DAI_CONTRACT_ADDRESS = '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359';

async function main() {
  const provider = new WebsocketProvider('wss://mainnet.infura.io/ws');
  const eth = Eth.fromProvider(provider);
  const net = new Net(eth);

  try {
    console.log(`Connected to network: ${await net.getNetworkType()}`);
    console.log(`Network Id: ${await eth.getId()}`);
    console.log(`Node info: ${await eth.getNodeInfo()}`);

    const balance = await getBalance(eth, ZERO_ADDRESS);
    console.log(`Balance of 0 address ETH: ${balance}`);

    const contract = new DaiContract(eth, DAI_CONTRACT_ADDRESS);
    const daiBalance = await contract.methods.balanceOf(ZERO_ADDRESS).call();
    console.log(`Balance of 0 address DAI: ${fromWei(daiBalance, 'ether')}`);

    const password = 'mypassword';
    const account = Account.create(eth);
    const keystore = await account.encrypt(password);
    const decryptedAccount = await Account.fromKeystore(eth, keystore, password);

    const wallet = new Wallet(eth);
    wallet.add(decryptedAccount);
    wallet.create(2);

    const encryptedWallet = await wallet.encrypt(password);
    const decryptedWallet = await Wallet.fromKeystores(eth, encryptedWallet, password);

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
    provider.disconnect();
  }
}

main().catch(console.error);
