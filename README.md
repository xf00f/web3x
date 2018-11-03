# web3x

[![Version](https://img.shields.io/npm/v/web3x.svg)](https://www.npmjs.com/package/web3x)
[![Downloads](https://img.shields.io/npm/dw/web3x.svg)](https://www.npmjs.com/package/web3x)
[![Downloads](https://img.shields.io/npm/dw/web3x-es.svg)](https://www.npmjs.com/package/web3x-es)
[![GitHub Code Size](https://img.shields.io/github/languages/code-size/xf00f/web3x.svg)](https://github.com/xf00f/web3x)
[![GitHub Stars](https://img.shields.io/github/stars/xf00f/web3x.svg)](https://github.com/xf00f/web3x/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/xf00f/web3x.svg)](https://github.com/xf00f/web3x/issues)
[![Coverage](https://img.shields.io/coveralls/github/xf00f/web3x/v1.2.0.svg)](https://coveralls.io/github/xf00f/web3x)
[![License: LGPL v3](https://img.shields.io/badge/License-LGPL%20v3-blue.svg)](https://github.com/xf00f/web3x/blob/master/LICENSE)

TypeScript port of web3.js - for perfect types and tiny builds.

![Demo](https://user-images.githubusercontent.com/44038056/47954017-1d488c80-df7d-11e8-923c-a37f575b9afc.gif)

- [Why?](#why)
- [Usage](#usage)
- [Contract type safety](#contract-type-safety)
- [Differences](#differences)
- [Example projects](#example-projects)
- [Documentation](#documentation)
- [Packages](#packages)

## Why?

web3.js is a very popular Ethereum library, but there are a few issues.

- The Typescript typings are distributed separately and are not perfect.
- There's no way to to introduce type safety to contract code.
- It's large. Having not been ported to ES6 modules, it's hard for bundlers to tree-shake dead code.
- It has a package structure that leads to duplication of external libraries such as bn.js being included multiple times.
- The code contains side effects, circular dependencies, and is not as immutable or functional as it could be, making it difficult to respond to and resolve issues.

web3x attempts to solve all the above issues.

- It is pure TypeScript.
- It enables type safe contract interactions by generating typed interfaces from ABIs (remote or local).
- It significantly reduces dependencies on external libraries.
- It compiles to both commonjs and ES6 module versions for node.js and ES6 aware web bundlers such as webpack.
- It uses jest for testing.
- It strives for functional, immutable, reusable components, allowing the developer to only use, and therefore bundle, exactly what's necessary.

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
  const web3 = new Web3('wss://mainnet.infura.io/ws');
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

## Contract type safety

Interacting with contracts without type safety is tedious at best, and dangerous at worst. web3x provides either a manual way of introducing type safety to contracts, or an automatic way by introducing a code generation step into your build process. By defining a contracts interface and passing it to a contract instance, a developer can continue to use web3x as normal but with the additional type safety checks on method calls, return values and event logs.

### Manual contract interfaces

The preferred way of enabling contract type safety is to use the automated system, however it can be beneficial to understand the manual process to understand what the code generator does for you. An example contract ABI plus interface and its usage is demonstrated below:

```typescript
interface MyContractDefinition {
  methods: {
    balance(who: Address): Quantity;
    send(to: Address, value: Quantity): void;
  };
  events: {
    Transfer: {
      to: Address;
      amount: Quantity;
    };
  };
}

const abi: ContractDefinition = [
  {
    name: 'balance',
    type: 'function',
    inputs: [{ name: 'who', type: 'address' }],
    constant: true,
    outputs: [{ name: 'value', type: 'uint256' }],
  },
  {
    name: 'send',
    type: 'function',
    inputs: [{ name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    name: 'Transfer',
    type: 'event',
    inputs: [{ name: 'to', type: 'address', indexed: true }, { name: 'amount', type: 'uint256', indexed: true }],
  },
];

async function sendFullBalanceFromTo(eth: Eth, contractAddress: Address, from: Address, to: Address) {
  const contract = new Contract<MyContractDefinition>(eth, abi, contractAddress);
  // The following code is fully type checked.
  const balance = await contract.methods.balance(from).call({ from });
  const receipt = await contract.methods.send(to, balance).send({ from });
  console.log(`Sent ${receipt.events!.Transfer[0].amount} to ${receipt.events!.Transfer[0].to}.`);
}
```

Given the contract ABI, the developer can specify an interface in TypeScript that outlines both the contracts methods, and events. This type is then passed as a type parameter to the `Contract` generic. This generic will ensure the type information is carried through to the appropriate method calls and responses. One nuance to take note of, methods that result in transactions on the blockchain with `send` calls should explicitly return `void`. If a different or no type is given the method will only permit a readonly `call` which is usually used to return a value such as a balance in the example above.

### Automated contract interfaces

The preferred approach is to use code generation to generate the contract interface from the ABI, and to wrap everything up in a derived contract class. Installing web3x includes a tool called `web3x-codegen` in your projects local `bin` folder. When run (e.g. `yarn web3x-codegen`) this will attempt to parse a file called `contracts.json`, will fetch the ABI's from the given locations (either local or remote), and will generate contract classes that conform to the same api as a standard untyped `Contract` instance, but with the additional type safety. An example `contracts.json` looks like:

```json
{
  "outputPath": "./src/contracts",
  "contracts": {
    "DaiContract": "http://api.etherscan.io/api?module=contract&action=getabi&address=0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359&format=raw",
    "MyContract": "../truffle-project/build/contracts/MyContract.json"
  }
}
```

This tells the generator download the ABI for the DAI token from the given location on etherscan, and to generate the interface at `./src/contracts/DaiContract.ts`. It also specifies a local ABI file and to generate its interface at `./src/contracts/MyContract.ts`. The json files output by truffle are not pure ABIs, but the code generator will detect it's a truffle output and will extract the ABI accordingly.

For an example of the code generated, take a look at this [example](example-projects/node/src/contracts/DaiContract.ts). As you can see there are two exports, both the definition and the wrapper class. The easiest way to use it is with the class as in this example:

```typescript
import { fromWei } from 'web3x/utils';
import { WebsocketProvider } from 'web3x/providers';
import { Eth } from 'web3x/eth';
import { DaiContract } from './contracts/DaiContract';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const DAI_CONTRACT_ADDRESS = '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359';

async function main() {
  const provider = new WebsocketProvider('wss://mainnet.infura.io/ws');
  const eth = Eth.fromProvider(provider);

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

## Packages

- [web3x](https://www.npmjs.com/package/web3x) (for Node.js)
- [web3x-es](https://www.npmjs.com/package/web3x-es) (for ES6 aware tools such as Webpack)
