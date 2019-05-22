import { toBigIntBE } from 'bigint-buffer';
import { readdirSync } from 'fs';
import levelup from 'levelup';
import memdown from 'memdown';
import * as rlp from 'rlp';
import { Address } from '../../address';
import { hexToBuffer, hexToNumber, leftPad, sha3 } from '../../utils';
import { BlockchainContext } from '../blockchain';
import { TxSubstrate } from '../tx';
import { EvmContext } from '../vm';
import { WorldState } from '../world';

const suites: { dir: string; include?: RegExp; exclude?: RegExp[] }[] = [
  { dir: 'vmArithmeticTest' },
  { dir: 'vmBitwiseLogicOperation' },
  { dir: 'vmBlockInfoTest' },
  { dir: 'vmEnvironmentalInfo' },
  {
    dir: 'vmIOandFlowOperations',
    exclude: [/foreverOutOfGas/, /^gas/],
  },
  { dir: 'vmLogTest' },
  { dir: 'vmPushDupSwapTest', exclude: [/Suicide/] },
  { dir: 'vmRandomTest' },
  { dir: 'vmSha3Test' },
  { dir: 'vmSystemOperations', exclude: [/suicide/] },
];

function hexToBigInt(hex: string) {
  return toBigIntBE(hexToBuffer(hex));
}

interface TestAccount {
  balance: string;
  nonce: string;
  code: string;
  storage: {
    [addr: string]: string;
  };
}

interface Test {
  exec: any;
  env: any;
  out: any;
  logs: any;
  pre: {
    [acc: string]: TestAccount;
  };
  post: {
    [acc: string]: TestAccount;
  };
}

interface TestSuite {
  [testName: string]: Test;
}

for (const { include, exclude, dir } of suites) {
  const testPath = `${__dirname}/test-data/VMTests/${dir}`;
  describe(dir, () => {
    const files = readdirSync(testPath)
      .filter(f => !include || include.test(f))
      .filter(f => !exclude || !exclude.some(re => re.test(f)));

    for (const testFile of files) {
      const suite = require(`${testPath}/${testFile}`) as TestSuite;
      Object.entries(suite).forEach(runTest);
    }
  });
}

function runTest([testName, testSpec]: [string, Test]) {
  it(testName, async () => {
    const { pre, post, exec, env, out, logs } = testSpec;
    const worldState = await WorldState.fromDb(levelup(memdown()));

    worldState.checkpoint();
    for (const [address, { balance, nonce, code, storage }] of Object.entries(pre)) {
      const account = await worldState.createAccount(
        Address.fromString(address),
        hexToBigInt(balance),
        hexToBigInt(nonce),
        hexToBuffer(code),
      );
      for (const [storeAddr, value] of Object.entries(storage as { [k: string]: string })) {
        await account.storage.put(hexToBuffer(leftPad(storeAddr, 64)), hexToBuffer(value));
      }
    }
    await worldState.commit();

    const blockchainCtx: BlockchainContext = {
      difficulty: hexToBigInt(env.currentDifficulty),
      coinbase: Address.fromString(env.currentCoinbase),
      last256BlockHashes: [],
      blockNumber: hexToNumber(env.currentNumber),
      blockGasLimit: hexToBigInt(env.currentGasLimit),
      timestamp: hexToNumber(env.currentTimestamp),
    };

    const { error, status, returned, txSubstrate } = await messageCall(
      worldState,
      blockchainCtx,
      Address.fromString(exec.caller),
      Address.fromString(exec.origin),
      Address.fromString(exec.address),
      hexToBuffer(exec.code),
      hexToBigInt(exec.gas),
      hexToBigInt(exec.gasPrice),
      hexToBigInt(exec.value),
      hexToBigInt(exec.value),
      hexToBuffer(exec.data),
      0,
      true,
    );

    if (out) {
      expect(returned).toEqual(hexToBuffer(out));
    }

    if (logs) {
      const hash = sha3(rlp.encode(txSubstrate.logs.map(log => [log.address.toBuffer(), log.topics, log.data])));
      expect(logs).toBe(hash);
    }

    if (!post) {
      return;
    }

    expect(error).toBeUndefined();
    expect(status).toBeTruthy();

    for (const [addressStr, { balance, nonce, code, storage }] of Object.entries(post)) {
      const address = Address.fromString(addressStr);
      const account = await worldState.loadImmutableAccount(address);
      expect(account!.address).toEqual(address);
      expect(account!.balance).toBe(hexToBigInt(balance));
      expect(account!.nonce).toBe(hexToBigInt(nonce));
      expect(account!.code).toEqual(hexToBuffer(code));
      for (const [storeAddr, expectedValue] of Object.entries(storage as { [k: string]: string })) {
        const value = await account!.storage.get(hexToBuffer(leftPad(storeAddr, 64)));
        expect(toBigIntBE(value).toString(16)).toBe(hexToBigInt(expectedValue).toString(16));
      }
    }
  });
}

async function messageCall(
  worldState: WorldState,
  blockchainCtx: BlockchainContext,
  caller: Address,
  origin: Address,
  executor: Address,
  code: Buffer,
  availableGas: bigint,
  gasPrice: bigint,
  transferValue: bigint,
  executionValue: bigint,
  data: Buffer,
  callDepth: number,
  modify: boolean,
) {
  worldState.checkpoint();

  // const callerAccount = (await worldState.loadAccount(caller))!;
  const recipientAccount = await worldState.loadOrCreateAccount(executor);
  const txSubstrate = new TxSubstrate();

  // recipientAccount.balance += transferValue;
  // callerAccount.balance -= transferValue;

  const callContext = new EvmContext(
    worldState,
    blockchainCtx,
    code,
    data,
    origin,
    caller,
    executor,
    transferValue,
    executionValue,
    availableGas,
    gasPrice,
    recipientAccount.storage,
    callDepth,
    modify,
    txSubstrate,
  );
  await recipientAccount.run(callContext);

  if (callContext.reverted) {
    await worldState.revert();
  } else {
    await worldState.commit();
  }

  return {
    remainingGas: BigInt(0),
    txSubstrate,
    status: !callContext.reverted,
    error: callContext.error,
    returned: callContext.returned,
  };
}
