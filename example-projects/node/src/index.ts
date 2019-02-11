import { Account } from 'web3x/account';
import { Address } from 'web3x/address';
import { Eth } from 'web3x/eth';
import { Net } from 'web3x/net';
import { WebsocketProvider } from 'web3x/providers';
import { fromWei, recover, sign } from 'web3x/utils';
import { Wallet } from 'web3x/wallet';
import { DaiContract } from './contracts/DaiContract';

const DAI_CONTRACT_ADDRESS = Address.fromString('0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359');

async function main() {
  // Construct necessary components.
  const provider = new WebsocketProvider('wss://mainnet.infura.io/ws');
  const eth = new Eth(provider);
  const net = new Net(eth);

  try {
    console.log(`Connected to network: ${await net.getNetworkType()}`);
    console.log(`Network Id: ${await eth.getId()}`);
    console.log(`Node info: ${await eth.getNodeInfo()}`);

    // Simple balance query.
    const balance = await eth.getBalance(Address.ZERO);
    console.log(`Balance of 0 address ETH: ${fromWei(balance, 'ether')}`);

    // Use our type safe auto generated dai contract.
    const contract = new DaiContract(eth, DAI_CONTRACT_ADDRESS);
    const daiBalance = await contract.methods.balanceOf(Address.ZERO).call();
    console.log(`Balance of 0 address DAI: ${fromWei(daiBalance, 'ether')}`);

    // Create an account, encrypt and decrypt.
    const password = 'mypassword';
    const account = Account.create();
    const keystore = await account.encrypt(password);
    const decryptedAccount = await Account.fromKeystore(keystore, password);

    // Add the account to the wallet, create another 2.
    const wallet = new Wallet();
    wallet.add(decryptedAccount);
    wallet.create(2);

    // If you want eth to use your accounts for signing transaction, set the wallet.
    eth.wallet = wallet;

    // Optionally you can specify a default 'from' address.
    eth.defaultFromAddress = account.address;

    const encryptedWallet = await wallet.encrypt(password);
    const decryptedWallet = await Wallet.fromKeystores(encryptedWallet, password);

    console.log(`Decrypted wallet has ${decryptedWallet.length} accounts.`);
    const signingAccount = decryptedWallet.get(2)!;

    // Sign a message.
    console.log(`Signing message with address: ${signingAccount.address}`);
    const msg = 'My signed text';
    const sig = sign(msg, signingAccount.privateKey);

    // Verify message was signed by account.
    const address = recover(msg, sig.signature);
    if (address.equals(signingAccount.address)) {
      console.log(`Message was signed by: ${address}`);
    } else {
      console.error(`Incorrect signature for message ${address}.`);
    }
  } finally {
    provider.disconnect();
  }
}

main().catch(console.error);
