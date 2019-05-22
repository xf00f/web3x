import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class NumberOp implements OpCode {
  public readonly code = 0x43;
  public readonly mnemonic = 'NUMBER';
  public readonly description = 'Get the current block number';
  public readonly gas = 2;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    context.stack.push(BigInt(context.blockchainCtx.blockNumber));
    context.ip += this.bytes;
  }
}

export const BlockNumber = new NumberOp();
