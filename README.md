# web3x

[![Version](https://img.shields.io/npm/v/web3x.svg)](https://www.npmjs.com/package/web3x)
[![Downloads](https://img.shields.io/npm/dw/web3x-es.svg)](https://www.npmjs.com/package/web3x-es)
[![Downloads](https://img.shields.io/npm/dw/web3x.svg)](https://www.npmjs.com/package/web3x)
[![GitHub Repo Size](https://img.shields.io/github/repo-size/xf00f/web3x.svg)](https://github.com/xf00f/web3x)
[![GitHub Stars](https://img.shields.io/github/stars/xf00f/web3x.svg)](https://github.com/xf00f/web3x/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/xf00f/web3x.svg)](https://github.com/xf00f/web3x/issues)
[![License: LGPL v3](https://img.shields.io/badge/License-LGPL%20v3-blue.svg)](https://github.com/xf00f/web3x/blob/master/LICENSE)


TypeScript port of web3.js.

## Packages

- [ES6](https://www.npmjs.com/package/web3x-es) (for ES6 aware tools such as Webpack)
- [CommonJS](https://www.npmjs.com/package/web3x) (for Node.js)

## Why?

web3.js is a very popular Ethereum library, but there are a few issues.

- The Typescript typings are distributed separately and are not perfect.
- It has not been fully ported to use ES6 modules, making it harder for bundlers to tree-shake dead code.
- It has a package structure that leads to duplication of external libraries such as bn.js being included multiple times.
- The code contains side effects, circular dependencies, and is not as immutable or functional as it could be, making it difficult to respond to and resolve issues.

web3x attempts to solve all the above issues.

- It is pure TypeScript.
- It uses jest for testing.
- It attempts to reduce dependencies on external libraries.
- It compiles to both commonjs and ES6 module versions for node.js and ES6 aware web bundlers such as webpack.
- It strives for functional, immutable, reusable components, allowing the developer to only use, and therefore build, exactly what's necessary.

In a small example that prints an Eth balance compiled with webpack, web3.js produced an output file of 858k, web3x produced a file of 119k. That's an 86% reduction.
Working with contracts increased the build size to 159k, and working with local accounts in localStorage increased it to 338k. The majority of Dapps are probably expecting
a user to be using a provider like MetaMask for account handling, so they can reliably work with a minimum build of ~160k uncompressed (46k compressed).
It's also likely this can be improved further.

## Usage

There are two builds of the library. `web3x` uses commonjs style imports and is best used for node.js backends. `web3x-es` uses ES6 imports and is best used for ES6 aware tools like webpack.
You can use web3x much like you would web3.js, requiring minimal changes necessary to an existing codebase. However, this will possibly result in larger than necessary builds.
Example usage:

```typescript
import { Web3 } from 'web3x-es';
import { fromWei } from 'web3x-es/utils';

async function main() {
  const web3 = new Web3('ws://localhost:7545');
  const balance = await web3.eth.getBalance('0x0000000000000000000000000000000000000000');
  document.body.innerText = `Balance of 0 address ETH: ${fromWei(balance, 'ether')}`;
  web3.close();
}

main().catch(console.error);
```

A minimal (~119k) implementation of the above would look like:

```typescript
import { WebsocketProvider } from 'web3x-es/providers';
import { Eth } from 'web3x-es/eth';
import { fromWei } from 'web3x-es/utils';

async function main() {
  const provider = new WebsocketProvider('wss://mainnet.infura.io/ws');
  const eth = Eth.fromProvider(provider);
  const balance = await eth.getBalance('0x0000000000000000000000000000000000000000');
  document.body.innerText = `Balance of 0 address ETH: ${fromWei(balance, 'ether')}`;
  provider.disconnect();
}

main().catch(console.error);
```

See example projects for more complex examples.

## Differences

This is not a perfect drop in replacement for web3.js, certain things have changed. However it is very close to the original API and porting an application to use it shouldn't be too challenging.
It is recommended however that you look at an example project to understand the best way to initialise components to minimise build sizes.

- Callbacks for request/response style calls no longer supported, promises only.
- Functions that don't depend on surrounding class state have been moved to utils (e.g. `sign`, `recover`).
- Explicitly import parts of the library rather then accessing them via web3 object. (e.g. `web3.utils` no longer available.)
- Sanitize some hybrid types. e.g. access wallet accounts via `wallet.get(0)` rather than `wallet[0]`.

## Example projects

Two example TypeScript projects are included, one for [webpack](example-projects/webpack) and one for [node.js](example-projects/node). They are configured to work with jest for testing. Adapting them to pure JavaScript if you don't want to use TypeScript should be trivial.

## Documentation

API documentation has not yet been ported from web3.js. For now the recommended approach for familiarising yourself with the library would be the following, in preferential order:

- Read the web3.js documentation at https://web3js.readthedocs.io/en/1.0/ to familiarise yourself with its API. web3x is almost identical if you don't care about minimising build sizes.
- Take a look at the [webpack example](example-projects/webpack/src/index.ts) to get an idea of how to structure components to minimise builds.
- Rely on your IDE and TypeScript to provide insight into the API.
- Delve into the code. It's significantly easier to follow and understand than web3.js.

## Missing functionality

The current features have not yet been ported.

- ssh
- bzz
- ens
