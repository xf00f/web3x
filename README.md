# web3x

[![Version](https://img.shields.io/npm/v/web3x.svg)](https://www.npmjs.com/package/web3x)
[![Downloads](https://img.shields.io/npm/dw/web3x.svg)](https://www.npmjs.com/package/web3x)
[![Downloads](https://img.shields.io/npm/dw/web3x-es.svg)](https://www.npmjs.com/package/web3x-es)
[![GitHub Code Size](https://img.shields.io/github/languages/code-size/xf00f/web3x.svg)](https://github.com/xf00f/web3x)
[![GitHub Stars](https://img.shields.io/github/stars/xf00f/web3x.svg)](https://github.com/xf00f/web3x/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/xf00f/web3x.svg)](https://github.com/xf00f/web3x/issues)
[![Coverage](https://img.shields.io/coveralls/github/xf00f/web3x/master.svg)](https://coveralls.io/github/xf00f/web3x)
[![License: LGPL v3](https://img.shields.io/badge/License-LGPL%20v3-blue.svg)](https://github.com/xf00f/web3x/blob/master/LICENSE)

TypeScript port of web3.js - for perfect types and tiny builds.

![Demo](https://user-images.githubusercontent.com/44038056/48001064-5d377d00-e0ff-11e8-994f-36d165f9124e.gif)

## Table of contents

- [Why?](#why)
- [Usage](#usage)
- [Contract type safety](#contract-type-safety)
- [The EVM provider](#the-evm-provider)
- [Differences](#differences)
- [Example projects](#example-projects)
- [Documentation](#documentation)
- [Packages](#packages)

## Why?

web3.js is a very popular Ethereum library, but:

- It has inaccurate typings and there's no way to to introduce type safety to contract code.
- It's large, weighing in at ~800k uncompressed.

web3x solves the above issues and more.

- It's pure TypeScript and generates contract types from ABIs.
- It's small, with a minimum sized contract interaction weighing in at ~150k uncompressed.
- It's expanding with additional features. For example the `EvmProvider` which provides a full inplace EVM implementation for executing contract code in your DAPP for simplified development workflows.

web3x also adopts a lean, functional design, and resolves many out the outstanding issues in the web3.js repository.
It is under active development, view the [CHANGELOG](CHANGELOG.md) to see updates and planned roadmap.

## Usage

There are two builds of the library. `web3x` uses CommonJS style imports and is best used for Node.js backends. `web3x-es` uses ES6 imports and is best used for ES6 aware tools like Webpack.

### Using inbuilt providers

The inbuilt providers are all [EIP-1193](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md) compatible, and are used as follows:

```typescript
import { Address } from 'web3x-es/address';
import { WebsocketProvider } from 'web3x-es/providers';
import { Eth } from 'web3x-es/eth';
import { fromWei } from 'web3x-es/utils';

async function main() {
  const provider = new WebsocketProvider('wss://mainnet.infura.io/ws');
  const eth = new Eth(provider);
  const balance = await eth.getBalance(Address.ZERO);
  document.body.innerText = `Balance of 0 address ETH: ${fromWei(balance, 'ether')}`;
}

main().catch(console.error);
```

### Using legacy providers, e.g. MetaMask

Until MetaMask and other providers are EIP-1193 compatible, you can use them with an adapter as follows:

```typescript
import { LegacyProvider, LegacyProviderAdapter } from 'web3x-es/providers';
import { Eth } from 'web3x-es/eth';

declare const web3: {
  currentProvider: LegacyProvider;
};

const eth = new Eth(new LegacyProviderAdapter(web3.currentProvider));
```

Or a shorthand version:

```typescript
import { Eth } from 'web3x-es/eth';
const eth = Eth.fromCurrentProvider();
```

See [example projects](example-projects) for more complex usage examples.

## Contract type safety

Interacting with contracts without type safety is tedious at best, and dangerous at worst. web3x provides a code generator called `web3x-codegen` to generate typings for contract ABIs either local, or remote from a simple configuration file called `contracts.json`.

### Defining contracts.json

An example `contracts.json` looks like:

```json
{
  "outputPath": "./src/contracts",
  "contracts": {
    "DaiContract": {
      "source": "etherscan",
      "net": "mainnet",
      "address": "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359"
    },
    "MyTruffleContract": {
      "source": "truffle",
      "buildFile": "../truffle-project/build/contracts/MyContract.json"
    },
    "MyRawAbiContract": {
      "source": "files",
      "abiFile": "../my-contract/abi.json",
      "initDataFile": "../my-contract/init-code.bin"
    }
  }
}
```

Run the code generator:

```
yarn web3x-codegen
```

The generator will create 3 contracts:

- For the first it uses etherscan to download the contract ABI and initialisation code at the given address, and generates the interface at `./src/contracts/DaiContract.ts`.
- For the second it specifies a truffle build output and generates its interface at `./src/contracts/MyTruffleContract.ts`.
- For the third it reads a raw ABI file and compiled initialisation code from local files, and generates its interface at `./src/contracts/MyRawAbiContract.ts`. The `initDataFile` property is optional but you won't be able to easily deploy the contract without it.

For an example of the code generated, take a look at this [example](example-projects/node/src/contracts/DaiContract.ts).

### Using generated contracts

The following code demonstrates how to use the generated contract class. It's a similar API as used in web3.js, only now with type safety.

```typescript
import { Address } from 'web3x/address';
import { fromWei } from 'web3x/utils';
import { WebsocketProvider } from 'web3x/providers';
import { Eth } from 'web3x/eth';
import { DaiContract } from './contracts/DaiContract';

const DAI_CONTRACT_ADDRESS = Address.fromString('0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359');

async function main() {
  const provider = new WebsocketProvider('wss://mainnet.infura.io/ws');
  const eth = new Eth(provider);

  try {
    const contract = new DaiContract(eth, DAI_CONTRACT_ADDRESS);
    const daiBalance = await contract.methods.balanceOf(Address.ZERO).call();
    console.log(`Balance of 0 address DAI: ${fromWei(daiBalance, 'ether')}`);
  } finally {
    provider.disconnect();
  }
}

main().catch(console.error);
```

Deploying contracts is trivial as well, as the bytecode is imported by `web3x-codegen` and included as part of the contract class.
The following code deploys an exact replica of the DAI contract on mainnet, only now you can mint your own funds.

```typescript
import { Address } from 'web3x/address';
import { fromWei, toWei } from 'web3x/utils';
import { WebsocketProvider } from 'web3x/providers';
import { Eth } from 'web3x/eth';
import { DaiContract } from './contracts/DaiContract';

async function main() {
  const from = Address.fromString('0x903ddd91207f737255ca93eb5885c0e087be0fc3');
  const gasPrice = 50000;
  const provider = new WebsocketProvider('wss://mainnet.infura.io/ws');
  const eth = new Eth(provider);

  try {
    const contract = new DaiContract(eth);
    await contract
      .deploy('xf00f token')
      .send({ from, gasPrice })
      .getReceipt();
    await contract.methods
      .mint(toWei(1000, 'ether'))
      .send({ from, gasPrice })
      .getReceipt();
    const balance = await contract.methods.balanceOf(from).call();
    console.log(`Balance of ${from}: ${fromWei(balance, 'ether')}`);
  } finally {
    provider.disconnect();
  }
}

main().catch(console.error);
```

## The EVM provider

There is an implmentation of the EVM which can be used for simplifying development workflows. Assuming you are building a browser
based DAPP the EVM will execute contract code directly in the browser without any dependency on third party processes such as ganache.
This can speed up prototyping of DAPPs and their associated contract code. This is an early-stage feature, not all opcodes have been
implmented so YMMV.

An example of how you might use this to deploy a contract and fund an account follows. The code below will persist all state in a browsers
IndexedDB. If you want to use an in-memory implementation you can use `levelup(memdown())` as per the test case [here](src/evm/provider/evm-provider.e2e.test.ts).

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

  return { provider, eth, daiContract };
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
  const recipientAccount = wallet.get(1)!.address;

  eth.defaultFromAddress = bootstrapAccount;
  console.log(`Bootstrap account: ${bootstrapAccount}`);

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
  const { provider, eth, daiContract } = getComponents();

  // Transfer funds to recipient address.
  await daiContract.methods
    .transfer(recipientAccount, toWei('1000', 'ether'))
    .send()
    .getReceipt();

  console.log(`Transferred 1000 DAI to ${recipientAccount}`);
}

main().catch(console.error);
```

## Differences

This is not a perfect drop in replacement for web3.js, there are differences.

- Callbacks for request/response style calls no longer supported, promises only.
- PromiEvent interface has been removed, in favour of `getTxHash()`, `getReceipt()` methods.
- Address objects must be used insead of strings. e.g. `Address.fromString('0x903ddd91207f737255ca93eb5885c0e087be0fc3')`
- Buffers are used for keys and data instead of `0x` prefixed strings.
- You should explicitly import parts of the library rather then accessing them via the web3 object.
- Sanitized some hybrid types, e.g. access wallet accounts via `wallet.get(0)` rather than `wallet[0]`.

## Example projects

Two example TypeScript projects are included, one for [webpack](example-projects/webpack) and one for [node.js](example-projects/node). They are configured to work with jest for testing. Adapting them to pure JavaScript if you don't want to use TypeScript should be trivial.

## Documentation

API documentation has not yet been ported from web3.js. For now the recommended approach for familiarising yourself with the library would be the following, in preferential order:

- Read the web3.js documentation at https://web3js.readthedocs.io/en/1.0/ to familiarise yourself with its API.
- Take a look at the example projects such as the [webpack example](example-projects/webpack/src/index.ts).
- Rely on your IDE and TypeScript to provide insight into the API.
- Delve into the code. It's significantly easier to follow and understand than web3.js.

## Packages

- [web3x](https://www.npmjs.com/package/web3x) (for Node.js)
- [web3x-es](https://www.npmjs.com/package/web3x-es) (for ES6 aware tools such as Webpack)
