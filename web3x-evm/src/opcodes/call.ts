import { toBufferBE } from 'bigint-buffer';
import { OpCode } from '.';
import { Address } from '../../address';
import { EvmContext } from '../vm/evm-context';
import { messageCall } from '../vm/message-call';

class CallOp implements OpCode {
  public readonly code = 0xf1;
  public readonly mnemonic = 'CALL';
  public readonly description = 'Message-call into an account';
  public readonly gas = 0;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public async handle(context: EvmContext) {
    const { stack, worldState, blockchainCtx, memory, origin, executor, gasPrice, callDepth, modify } = context;

    const gas = stack.pop();
    const addr = stack.pop();
    const value = stack.pop();
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
      value,
      value,
      calldata,
      callDepth + 1,
      modify,
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

export const Call = new CallOp();
