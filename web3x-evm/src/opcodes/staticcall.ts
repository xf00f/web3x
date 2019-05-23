/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { toBufferBE } from 'bigint-buffer';
import { Address } from 'web3x/address';
import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';
import { messageCall } from '../vm/message-call';

class StaticCallOp implements OpCode {
  public readonly code = 0xfa;
  public readonly mnemonic = 'STATICCALL';
  public readonly description = 'Static message-call into an account';
  public readonly gas = 0;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public async handle(context: EvmContext) {
    const { stack, worldState, blockchainCtx, memory, origin, executor, gasPrice, callDepth } = context;

    const gas = stack.pop();
    const addr = stack.pop();
    const inOffset = stack.pop();
    const inSize = stack.pop();
    const retOffset = stack.pop();
    const retSize = stack.pop();

    const recipient = new Address(toBufferBE(addr, 20));
    const calldata = memory.loadN(inOffset, Number(inSize));

    const { txSubstrate, reverted, returned } = await messageCall(
      worldState,
      blockchainCtx,
      executor,
      origin,
      recipient,
      recipient,
      gas,
      gasPrice,
      BigInt(0),
      BigInt(0),
      calldata,
      callDepth + 1,
      false,
    );

    context.stack.push(BigInt(reverted ? 0 : 1));

    if (txSubstrate) {
      context.txSubstrate.logs.push(...txSubstrate.logs);
    }

    context.memory.storeN(retOffset, returned.slice(0, Number(retSize)));
    context.lastReturned = returned;

    context.ip += this.bytes;
  }
}

export const StaticCall = new StaticCallOp();
