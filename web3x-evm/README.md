# web3x-evm

[![Version](https://img.shields.io/npm/v/web3x-evm.svg)](https://www.npmjs.com/package/web3x-evm)
[![Downloads](https://img.shields.io/npm/dw/web3x-evm.svg)](https://www.npmjs.com/package/web3x-evm)
[![Downloads](https://img.shields.io/npm/dw/web3x-evm-es.svg)](https://www.npmjs.com/package/web3x-evm-es)
[![GitHub Stars](https://img.shields.io/github/stars/xf00f/web3x.svg)](https://github.com/xf00f/web3x/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/xf00f/web3x.svg)](https://github.com/xf00f/web3x/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/xf00f/web3x/blob/master/web3x-codegen/LICENSE)

A TypeScript implementation of the EVM which can be used for simplifying development workflows.

Assuming you are building a browser based app the `EvmProvider` will execute contract code directly in the browser without any dependency on third party processes such as ganache.
This can speed up prototyping of apps and their associated contract code. This is an early-stage feature, not all opcodes have been implmented so YMMV.

## Missing opcodes

To be implemented soon.

- `EXTCODECOPY`
- `BLOCKHASH`
- `CREATE`
- `CALLCODE`
- `SELFDESTRUCT`

## Usage

An example of how you might use this to deploy a contract and fund an account follows. The code below will persist all state in a browsers
IndexedDB. If you want to use an in-memory implementation you can use `levelup(memdown())` as per the test case [here](src/provider/evm-provider.e2e.test.ts).

```typescript
import { EvmProvider } from 'web3x-es/evm/provider';
import { Eth } from 'web3x-es/eth';
import { toWei } from 'web3x-es/utils';
import { Wallet } from 'web3x-es/wallet';
import { DaiContract } from './contracts/DaiContract';

async function getComponents(fresh: boolean = false) {
  const daiContractAddrStr = window.localStorage.getItem('DaiContractAddress');
  const daiContractAddr = !fresh && daiContractAddrStr ? Address.fromString(daiContractAddrStr) : await bootstrap();

  // Load the wallet this provider was initialised with.
  const wallet = await Wallet.fromLocalStorage('', 'provider-wallet');

  // Blocks will be mined with a 1000ms delay.
  const provider = await EvmProvider.fromLocalDb('testdb', { blockDelay: 1000, wallet });
  const eth = new Eth(provider);
  const daiContract = new DaiContract(eth, daiContractAddr, { gasPrice: 50000 });

  return { provider, eth, daiContract, wallet };
}

async function bootstrap() {
  console.log('Erasing existing database.');
  await EvmProvider.eraseLocalDb('testdb');

  const provider = await EvmProvider.fromLocalDb('testdb');
  const eth = new Eth(provider);

  const wallet = new Wallet(10);
  await wallet.saveToLocalStorage('', 'provider-wallet');

  // Create all wallet accounts on the simulated chain. Will preload ETH into each account.
  await provider.loadWallet(wallet);

  const bootstrapAccount = wallet.get(0)!.address;
  eth.defaultFromAddress = bootstrapAccount;

  const daiContract = new DaiContract(eth, undefined, { gasPrice: 50000 });

  // Deploy the contract.
  await daiContract
    .deploy(utf8ToHex('xf00f token'))
    .send()
    .getReceipt();
  console.log(`Deployed DAI contract at ${daiContract.address!}`);

  // Mint some DAI into the bootstrap account.
  await daiContract.methods
    .mint(bootstrapAccount, toWei('1000', 'ether'))
    .send()
    .getReceipt();

  console.log(`Minted 1000 DAI into ${bootstrapAccount}`);

  window.localStorage.setItem('DaiContractAddress', daiContract.address!.toString());
  return daiContract.address!;
}

async function main() {
  const { provider, eth, daiContract, wallet } = getComponents();

  const from = wallet.get(0)!.address;
  const to = wallet.get(1)!.address;

  // Transfer funds to recipient address.
  await daiContract.methods
    .transfer(to, toWei('1000', 'ether'))
    .send({ from })
    .getReceipt();

  console.log(`Transferred 1000 DAI to ${to}`);
}

main().catch(console.error);
```

## Packages

- [web3x-evm](https://www.npmjs.com/package/web3x-evm)
- [web3x-evm-es](https://www.npmjs.com/package/web3x-evm-es)
