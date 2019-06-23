# web3x

[![Version](https://img.shields.io/npm/v/web3x.svg)](https://www.npmjs.com/package/web3x)
[![Downloads](https://img.shields.io/npm/dm/web3x.svg)](https://www.npmjs.com/package/web3x)
[![GitHub Stars](https://img.shields.io/github/stars/xf00f/web3x.svg)](https://github.com/xf00f/web3x/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/xf00f/web3x.svg)](https://github.com/xf00f/web3x/issues)
[![Coverage](https://img.shields.io/coveralls/github/xf00f/web3x/master.svg)](https://coveralls.io/github/xf00f/web3x)

Ethereum TypeScript Client Library - for perfect types and tiny builds.

![Demo](https://user-images.githubusercontent.com/44038056/48001064-5d377d00-e0ff-11e8-994f-36d165f9124e.gif)

## Overview

`web3x` was created originally as a pure TypeScript port of `web3.js`. Although its API has diverged slightly from `web3.js`,
it still maintains a strong degree of alignment and porting from one to the other should be fairly trivial.

`web3x` provides full type safety when interacting with contracts by building type definitions from contract ABIs.

It has its own EVM implementation for testing contract behaviour fully in process using standard testing tools (e.g. Jest).

## Packages

This monorepo is split into several sub-packages.

- [web3x](/web3x) - main client library.
- [web3x-codegen](/web3x-codegen) - tool for generating type safe contract classes from ABIs.
- [web3x-evm](/web3x-evm) - EVM implementation for testing contract code completely in process or in browser.
- [web3x-node-example](/web3x-node-example) - Example backend TypeScript project with Jest for testing.
- [web3x-webpack-example](/web3x-webpack-example) - Example frontend TypeScript Webpack project with Jest for testing.

## Versioning

Versioning is managed manually, and follows the same pattern as Lerna fixed mode.
Lerna is not used due to a [trilemma](https://github.com/lerna/lerna/issues/901) that the Lerna maintainer refuses to resolve:

- A PR should correctly modify `version.json` and package version numbers.
- For minor or patch changes, the packages that changed need their version set to the new version in `version.json`.
- For major version changes, all packages should have their version numbers set to the new version in `version.json`.
- All changes across all packages are tracked in the [CHANGELOG](CHANGELOG.md).
- After merging the PR to master, the repository should be tagged with the new version number.
