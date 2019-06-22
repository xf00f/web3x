# web3x

[![Version](https://img.shields.io/npm/v/web3x.svg)](https://www.npmjs.com/package/web3x)
[![Downloads](https://img.shields.io/npm/dm/web3x.svg)](https://www.npmjs.com/package/web3x)
[![GitHub Stars](https://img.shields.io/github/stars/xf00f/web3x.svg)](https://github.com/xf00f/web3x/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/xf00f/web3x.svg)](https://github.com/xf00f/web3x/issues)
[![Coverage](https://img.shields.io/coveralls/github/xf00f/web3x/master.svg)](https://coveralls.io/github/xf00f/web3x)

Ethereum TypeScript Client Library - for perfect types and tiny builds.

![Demo](https://user-images.githubusercontent.com/44038056/48001064-5d377d00-e0ff-11e8-994f-36d165f9124e.gif)

## Packages

This monorepo is split into several sub-packages.

- [web3x](/web3x) - main client library.
- [web3x-codegen](/web3x-codegen) - tool for generating type safe contract classes from ABIs.
- [web3x-evm](/web3x-evm) - EVM implementation for testing contract code completely in process or in browser.
- [web3x-node-example](/web3x-node-example) - Example backend TypeScript project with Jest for testing.
- [web3x-webpack-example](/web3x-webpack-example) - Example frontend TypeScript Webpack project with Jest for testing.

## Versioning

Versioning works as in Lerna fixed mode:

- A PR should contain the correctly modified `version.json` and package version numbers.
- For minor or patch changes, the packages that changed need their version set to the new version in `version.json`.
- For major version changes, all packages should have their version numbers set to the new version in `version.json`.
- All changes across all packages are tracked in the [CHANGELOG](CHANGELOG.md).
- After merging the PR to master, the repository should be tagged with the new version number.
