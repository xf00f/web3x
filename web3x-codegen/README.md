# web3x-codegen

[![Version](https://img.shields.io/npm/v/web3x-codegen.svg)](https://www.npmjs.com/package/web3x-codegen)
[![Downloads](https://img.shields.io/npm/dw/web3x-codegen.svg)](https://www.npmjs.com/package/web3x-codegen)
[![GitHub Stars](https://img.shields.io/github/stars/xf00f/web3x.svg)](https://github.com/xf00f/web3x/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/xf00f/web3x.svg)](https://github.com/xf00f/web3x/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/xf00f/web3x/blob/master/web3x-codegen/LICENSE)

Contract interface code generator for `web3x`.

Interacting with contracts without type safety is tedious at best, and dangerous at worst. `web3x-codegen` generates typings for contract ABIs either local, or remote from a simple configuration file called `contracts.json`.

### Installing

```
yarn add -D web3x-codegen
```

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

For an example of the code generated, take a look at this [example](../web3x-node-example/src/contracts/DaiContract.ts).

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

## Packages

- [web3x-codegen](https://www.npmjs.com/package/web3x-codegen)
