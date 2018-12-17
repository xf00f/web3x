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
- [Differences](#differences)
- [Example projects](#example-projects)
- [Documentation](#documentation)
- [Packages](#packages)

## Why?

web3.js is a very popular Ethereum library, but:

- It has inaccurate typings and there's no way to to introduce type safety to contract code.
- It's large, weighing in at ~800k uncompressed.

web3x solves the above issues.

- It's pure TypeScript and generates contract types from ABIs.
- It's small, with a minimum sized contract interaction weighing in at ~150k uncompressed.

## Usage

There are two builds of the library. `web3x` uses CommonJS style imports and is best used for Node.js backends. `web3x-es` uses ES6 imports and is best used for ES6 aware tools like Webpack.

### Using inbuilt providers

The inbuilt providers are all EIP-1193 compatible, and are used as follows:

```typescript
import { WebsocketProvider } from 'web3x-es/providers';
import { Eth } from 'web3x-es/eth';
import { fromWei } from 'web3x-es/utils';

async function main() {
  const provider = new WebsocketProvider('wss://mainnet.infura.io/ws');
  const eth = new Eth(provider);
  const balance = await eth.getBalance('0x0000000000000000000000000000000000000000');
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

See example projects for more complex examples.

## Contract type safety

Interacting with contracts without type safety is tedious at best, and dangerous at worst. web3x provides a code generator called `web3x-codegen` to generate typings for contract ABIs either local, or remote from a simple configuration file called `contracts.json`.

### Defining contracts.json

An example `contracts.json` looks like:

```json
{
  "outputPath": "./src/contracts",
  "contracts": {
    "DaiContract": "http://api.etherscan.io/api?module=contract&action=getabi&address=0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359&format=raw",
    "MyContract": "../truffle-project/build/contracts/MyContract.json"
  }
}
```

Run the code generator:

```
yarn web3x-codegen
```

The generator downloads the ABI for the DAI token from the given location on etherscan, and generates the interface at `./src/contracts/DaiContract.ts`. It also specifies a local ABI file and generates its interface at `./src/contracts/MyContract.ts`. The json files output by truffle are not pure ABIs, but the code generator will detect it's a truffle output and will extract the ABI accordingly.

For an example of the code generated, take a look at this [example](example-projects/node/src/contracts/DaiContract.ts).

### Using generated contracts

The following code demonstrates how to use the generated contract class. It's the exact same API as used in web3.js, only now with type safety.

```typescript
import { fromWei } from 'web3x/utils';
import { WebsocketProvider } from 'web3x/providers';
import { Eth } from 'web3x/eth';
import { DaiContract } from './contracts/DaiContract';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const DAI_CONTRACT_ADDRESS = '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359';

async function main() {
  const provider = new WebsocketProvider('wss://mainnet.infura.io/ws');
  const eth = new Eth(provider);

  try {
    const contract = new DaiContract(eth, DAI_CONTRACT_ADDRESS);
    const daiBalance = await contract.methods.balanceOf(ZERO_ADDRESS).call();
    console.log(`Balance of 0 address DAI: ${fromWei(daiBalance, 'ether')}`);
  } finally {
    provider.disconnect();
  }
}

main().catch(console.error);
```

## Differences

This is not a perfect drop in replacement for web3.js, there are small differences.

- Callbacks for request/response style calls no longer supported, promises only.
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
