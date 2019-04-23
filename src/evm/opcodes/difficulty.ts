import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class DifficultyOp implements OpCode {
  public readonly code = 0x44;
  public readonly mnemonic = 'DIFFICULTY';
  public readonly description = 'Get the blocks difficulty.';
  public readonly gas = 1;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    context.stack.push(context.blockchainCtx.difficulty);
    context.ip += this.bytes;
  }
}

export const Difficulty = new DifficultyOp();
