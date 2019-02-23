# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.3] - 2019-02-23

### Fixed

- Logs for contracts other than that being sent to, are now put in the `anonymousLogs` field. This fixes a situation where event signatures match between different contracts called in the same transaction and the event gets parsed incorrectly.

## [3.0.2] - 2019-02-20

### Fixed

- Contracts with no constructor could not deploy.
- Fixed 0 padding bug that preventing some functions from being called.

## [3.0.1] - 2019-02-18

### Fixed

- `web3x-codegen` failed when ABI had no constructor.
- `web3x-codegen` generated bad deploy for some types.

### Changed

- Refactor some transaction logic.

## [3.0.0] - 2019-02-11

### Added

- `Address` class. Used everywhere where previously there were `0x` prefixed strings. Significantly safer.
- `web3x-codegen` now supports typesafe deployments and includes the compiled bytecode automatically.
- `EvmProvider`. An inline EVM for rapid development against smart contracts without any third party software. Considered alpha as not all opcodes yet implmented.
- Linting with `ts-lint`.

### Changed

- Refactor subscription code in favour of new leaner code.
- Sending transactions uses a new `getTxHash()` and `getReceipt()` interface.
- Refactor confirm transaction code.
- Refactor ABI defintion code for better encapsulation e.g. `ContractAbi`.

### Removed

- PromiEvent interface in favour of `getTxHash()` and `getReceipt()`.

## [2.0.4] - 2019-01-08

### Fixed

- Added `finally()` to PromiEvent.

## [2.0.3] - 2019-01-11

### Fixed

- Fix broken topic parameter construction when subscribing.

## [2.0.2] - 2019-01-11

### Fixed

- Fix web3.js [#1916](https://github.com/ethereum/web3.js/issues/1916)

## [2.0.1] - 2018-12-28

### Added

- Tests for `account` module.

### Fixed

- Code generator not resolving `package.json` correctly.

## [2.0.0] - 2018-12-16

### Changed

- All providers are now EIP-1193 compatible and an adapter has been added for older providers.
- Private keys are now passed around as `Buffer` and not `0x` prefixed strings.
- Improved typings.
- Further flattening of project structure.

### Removed

- Legacy API in favour of modular approach. e.g. No more `web3.accounts` or `web3.utils`. Just import.
- Request manager in favour of using providers directly.

## [1.2.3] - 2018-12-06

### Fixed

- Exception not being propagated when sending a transaction without `from` from `account` module.

## [1.2.2] - 2018-12-06

### Fixed

- Exception not being propagated when sending a transaction without `from`.

## [1.2.1] - 2018-11-03

### Changed

- README updates.
- Code generator improvements.

## [1.2.0] - 2018-11-01

### Added

- Inlined `ethers`.
- Code coverage.
- ENS port.
- Bzz port.
- Shh port
- Code generator added to produce contract types from ABIs.

## [1.1.0] - 2018-10-19

### Added

- LICENSE and licence headers.

### Changed

- Big refactor to improve build sizes.
- Typing improvements.
- Flatten project structure.

## [1.0.4] - 2018-10-17

### Changed

- Moved @types development dependencies that are used in the API to be dependencies.
- Use `tslib` to reduce build sizes.

## [1.0.3] - 2018-10-16

### Fixed

- Missing `ws` dependency.

### Changed

- README updates.
- Example project updates.

## [1.0.2] - 2018-10-11

### Changed

- Minor deployment script update.

## 1.0.1 - 2018-10-11

### Added

- Initial release of Typescript port from web3.js.

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
