# web3x

[![Version](https://img.shields.io/npm/v/web3x.svg)](https://www.npmjs.com/package/web3x)
[![Downloads](https://img.shields.io/npm/dm/web3x.svg)](https://www.npmjs.com/package/web3x)
[![Downloads](https://img.shields.io/npm/dm/web3x-es.svg)](https://www.npmjs.com/package/web3x-es)
[![GitHub Stars](https://img.shields.io/github/stars/xf00f/web3x.svg)](https://github.com/xf00f/web3x/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/xf00f/web3x.svg)](https://github.com/xf00f/web3x/issues)
[![Coverage](https://img.shields.io/coveralls/github/xf00f/web3x/master.svg)](https://coveralls.io/github/xf00f/web3x)
[![License: LGPL v3](https://img.shields.io/badge/License-LGPL%20v3-blue.svg)](https://github.com/xf00f/web3x/blob/master/LICENSE)

Ethereum TypeScript Client Library - for perfect types and tiny builds.

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

See example projects for more complex usage examples.

## Contract type safety

Interacting with contracts without type safety is tedious at best, and dangerous at worst. `web3x` provides a code generator called `web3x-codegen` to generate typings for contract ABIs either local, or remote from a simple configuration file called `contracts.json`.

Read more at [web3x-codegen](../web3x-codegen).

## The EVM provider

There is an implementation of the EVM which can be used for simplifying development workflows.

Read more at [web3x-evm](../web3x-evm).

## Differences

This is not a perfect drop in replacement for web3.js, there are differences.

- Callbacks for request/response style calls no longer supported, promises only.
- PromiEvent interface has been removed, in favour of `getTxHash()`, `getReceipt()` methods.
- Address objects must be used insead of strings. e.g. `Address.fromString('0x903ddd91207f737255ca93eb5885c0e087be0fc3')`
- Buffers are used for keys and data instead of `0x` prefixed strings.
- You should explicitly import parts of the library rather then accessing them via the web3 object.
- Sanitized some hybrid types, e.g. access wallet accounts via `wallet.get(0)` rather than `wallet[0]`.

## Example projects

Two example TypeScript projects are included, one for [webpack](../web3x-webpack-example) and one for [node.js](../web3x-node-example). They are configured to work with jest for testing. Adapting them to pure JavaScript if you don't want to use TypeScript should be trivial.

## Documentation

API documentation has not yet been ported from web3.js. For now the recommended approach for familiarising yourself with the library would be the following, in preferential order:

- Read the web3.js documentation at https://web3js.readthedocs.io/en/1.0/ to familiarise yourself with its API.
- Take a look at the example projects such as the [webpack example](../web3x-webpack-example/src/index.ts).
- Rely on your IDE and TypeScript to provide insight into the API.
- Delve into the code. It's significantly easier to follow and understand than web3.js.

## Packages

- [web3x](https://www.npmjs.com/package/web3x) (for Node.js)
- [web3x-es](https://www.npmjs.com/package/web3x-es) (for ES6 aware tools such as Webpack)
