# Changelog

All notable changes to this project will be documented in this file.

## [4.0.5] - 2019-10-26

- Add `internalType` to ABI data types.
- Imporove HTTP provider.

## [4.0.4] - 2019-08-26

- Add optional `gas` property to ABI interface as Vyper includes an estimate.
- Better typing on contract functions with multiple return types.

## [4.0.3] - 2019-06-27

- Fix `web3` undefined error in `eth.fromCurrentProvider()`.
- `BroadcastChannel` now shared between multiple `EvmProvider`'s in a single tab.

## [4.0.2] - 2019-06-24

- Create `web3x-evm-es` package for `web3x-es` compatiable version of EVM.

## [4.0.1] - 2019-06-23

- Fix `web3x-codegen` path resolution bug.

## [4.0.0] - 2019-06-23

- Major project restructure.
- `web3x-codegen` is its own package.
- `web3x-evm` is its own package.
- All packages but `web3x` are MIT licensed.

## [3.0.11] - 2019-05-22

- `EvmProvider` uses `BroadcastChannel` in browser to send newly mined blocks between tabs.
- `hexToNumber` can no longer take a `null`. Calling code must discern. This shouldn't break code obeying type signature.
- `Eth` has better implied type safety internally.
- `ropsten` added as Etherscan source.

## [3.0.10] - 2019-04-28

- Fix revert message undefined bug.
- Ignore existing accounts when loading wallet into EvmProvider.
- EXP opcode uses Buffer impl in browser.

## [3.0.9] - 2019-04-24

- Fix returndatacopy opcode size bug.
- Revert propagates error message.
- BlockNumber tests passing.
- Opcodes added: coinbase, difficulty, gaslimit, gasprice, origin.
- Fix contract linkage.
- Circle CI for pull requests.

## [3.0.8] - 2019-04-14

- Added several missing opcodes.
- Fixed bugs in opcodes.
- Added tests to test EVM against https://github.com/ethereum/tests

## [3.0.7] - 2019-04-01

- Added opcodes `SHR`, `SHL`, `ROR`, `ROL`, and `CODESIZE`.
- Fixed edge case bug involving code deployment.

## [3.0.6] - 2019-03-25

- `wallet` can be passed as option in `EvmProvider`.
- Removed unused `TxDeploy` import allowing `noUnusedLocals`.

## [3.0.5] - 2019-03-10

- `EvmProvider` opcodes and precompiles for contracts 6, 7 and 8, plus more.
- `nonce` can be added to contract tx sends.
- `decodeFunctionData` method added to `ContractAbi` to simplify manual tx decoding.

## [3.0.4] - 2019-03-02

- Improved type signatures for `getBlock` and `getUncles` to return precise types dependent on second parameter.
- `web3x-codegen` detects fixed size parameter arrays and correctly treats them as TypeScript arrays.

## [3.0.3] - 2019-02-23

- Logs for contracts other than that being sent to, are now put in the `anonymousLogs` field. This fixes a situation where event signatures match between different contracts called in the same transaction and the event gets parsed incorrectly.

## [3.0.2] - 2019-02-20

- Contracts with no constructor could not deploy.
- Fixed 0 padding bug that preventing some functions from being called.

## [3.0.1] - 2019-02-18

- `web3x-codegen` failed when ABI had no constructor.
- `web3x-codegen` generated bad deploy for some types.
- Refactor some transaction logic.

## [3.0.0] - 2019-02-11

- `Address` class. Used everywhere where previously there were `0x` prefixed strings. Significantly safer.
- `web3x-codegen` now supports typesafe deployments and includes the compiled bytecode automatically.
- `EvmProvider`. An inline EVM for rapid development against smart contracts without any third party software. Considered alpha as not all opcodes yet implmented.
- Linting with `ts-lint`.
- Refactor subscription code in favour of new leaner code.
- Sending transactions uses a new `getTxHash()` and `getReceipt()` interface.
- Refactor confirm transaction code.
- Refactor ABI defintion code for better encapsulation e.g. `ContractAbi`.
- PromiEvent interface in favour of `getTxHash()` and `getReceipt()`.

## [2.0.4] - 2019-01-08

- Added `finally()` to PromiEvent.

## [2.0.3] - 2019-01-11

- Fix broken topic parameter construction when subscribing.

## [2.0.2] - 2019-01-11

- Fix web3.js [#1916](https://github.com/ethereum/web3.js/issues/1916)

## [2.0.1] - 2018-12-28

- Tests for `account` module.
- Code generator not resolving `package.json` correctly.

## [2.0.0] - 2018-12-16

- All providers are now EIP-1193 compatible and an adapter has been added for older providers.
- Private keys are now passed around as `Buffer` and not `0x` prefixed strings.
- Improved typings.
- Further flattening of project structure.
- Legacy API in favour of modular approach. e.g. No more `web3.accounts` or `web3.utils`. Just import.
- Request manager in favour of using providers directly.

## [1.2.3] - 2018-12-06

- Exception not being propagated when sending a transaction without `from` from `account` module.

## [1.2.2] - 2018-12-06

- Exception not being propagated when sending a transaction without `from`.

## [1.2.1] - 2018-11-03

- README updates.
- Code generator improvements.

## [1.2.0] - 2018-11-01

- Inlined `ethers`.
- Code coverage.
- ENS port.
- Bzz port.
- Shh port
- Code generator added to produce contract types from ABIs.

## [1.1.0] - 2018-10-19

- LICENSE and licence headers.
- Big refactor to improve build sizes.
- Typing improvements.
- Flatten project structure.

## [1.0.4] - 2018-10-17

- Moved @types development dependencies that are used in the API to be dependencies.
- Use `tslib` to reduce build sizes.

## [1.0.3] - 2018-10-16

- Missing `ws` dependency.
- README updates.
- Example project updates.

## [1.0.2] - 2018-10-11

- Minor deployment script update.

## 1.0.1 - 2018-10-11

- Initial release of Typescript port from web3.js.

[4.0.5]: https://github.com/xf00f/web3x/compare/v4.0.4...v4.0.5
[4.0.4]: https://github.com/xf00f/web3x/compare/v4.0.3...v4.0.4
[4.0.3]: https://github.com/xf00f/web3x/compare/v4.0.2...v4.0.3
[4.0.2]: https://github.com/xf00f/web3x/compare/v4.0.1...v4.0.2
[4.0.1]: https://github.com/xf00f/web3x/compare/v4.0.0...v4.0.1
[4.0.0]: https://github.com/xf00f/web3x/compare/v3.0.11...v4.0.0
[3.0.11]: https://github.com/xf00f/web3x/compare/v3.0.10...v3.0.11
[3.0.10]: https://github.com/xf00f/web3x/compare/v3.0.9...v3.0.10
[3.0.9]: https://github.com/xf00f/web3x/compare/v3.0.8...v3.0.9
[3.0.8]: https://github.com/xf00f/web3x/compare/v3.0.7...v3.0.8
[3.0.7]: https://github.com/xf00f/web3x/compare/v3.0.6...v3.0.7
[3.0.6]: https://github.com/xf00f/web3x/compare/v3.0.5...v3.0.6
[3.0.5]: https://github.com/xf00f/web3x/compare/v3.0.4...v3.0.5
[3.0.4]: https://github.com/xf00f/web3x/compare/v3.0.3...v3.0.4
[3.0.3]: https://github.com/xf00f/web3x/compare/v3.0.2...v3.0.3
[3.0.2]: https://github.com/xf00f/web3x/compare/v3.0.1...v3.0.2
[3.0.1]: https://github.com/xf00f/web3x/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/xf00f/web3x/compare/v2.0.4...v3.0.0
[2.0.4]: https://github.com/xf00f/web3x/compare/v2.0.3...v2.0.4
[2.0.3]: https://github.com/xf00f/web3x/compare/v2.0.2...v2.0.3
[2.0.2]: https://github.com/xf00f/web3x/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/xf00f/web3x/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/xf00f/web3x/compare/v1.2.3...v2.0.0
[1.2.3]: https://github.com/xf00f/web3x/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/xf00f/web3x/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/xf00f/web3x/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/xf00f/web3x/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/xf00f/web3x/compare/v1.0.4...v1.1.0
[1.0.4]: https://github.com/xf00f/web3x/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/xf00f/web3x/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/xf00f/web3x/compare/v1.0.1...v1.0.2
