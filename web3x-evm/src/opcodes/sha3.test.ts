/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { toBigIntBE } from 'bigint-buffer';
import levelup from 'levelup';
import memdown from 'memdown';
import { Address } from 'web3x/address';
import { sha3 } from 'web3x/utils';
import { BlockchainContext } from '../blockchain';
import { EvmContext } from '../vm/evm-context';
import { WorldState } from '../world/world-state';
import { Sha3 } from './sha3';

describe('opcodes', () => {
  it('sha3', async () => {
    const db = levelup(memdown());
    const blockchainCtx: BlockchainContext = {
      timestamp: 0,
      difficulty: BigInt(0),
      blockGasLimit: BigInt(0),
      blockNumber: 0,
      last256BlockHashes: [],
      coinbase: Address.ZERO,
    };
    const context = new EvmContext(await WorldState.fromDb(db), blockchainCtx);

    const buffer1 = Buffer.from('00112233445566778899aabbccddeeff000102030405060708090a0b0c0d0e0f', 'hex');
    const buffer2 = Buffer.from('deadbeef00000000000000000000000000000000000000000000000000000000', 'hex');
    const buffer = Buffer.concat([buffer1, buffer2.slice(0, 4)]);

    const expected = sha3(buffer).slice(2);

    const word1 = toBigIntBE(buffer1);
    const word2 = toBigIntBE(buffer2);

    context.memory.storeWord(0x1000000000000000000000000000000000000000000000000000000000000000n, word1);
    context.memory.storeWord(0x1000000000000000000000000000000000000000000000000000000000000020n, word2);

    context.stack.push(36n);
    context.stack.push(0x1000000000000000000000000000000000000000000000000000000000000000n);

    Sha3.handle(context);

    expect(context.stack.pop()!.toString(16)).toBe(expected);
  });
});
