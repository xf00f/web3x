import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class SltOp implements OpCode {
  public readonly code = 0x12;
  public readonly mnemonic = 'SLT';
  public readonly description = 'Signed less-than comparison';
  public readonly gas = 3;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public slt(x: bigint, y: bigint) {
    const tt255 = BigInt(2) ** BigInt(255);
    const xSign = x - tt255;
    const ySign = y - tt255;
    if (xSign >= 0 && ySign < 0) {
      return BigInt(1);
    } else if (xSign < 0 && ySign >= 0) {
      return BigInt(0);
    } else {
      return x < y ? BigInt(1) : BigInt(0);
    }
  }

  public handle(context: EvmContext) {
    const x = context.stack.pop()!;
    const y = context.stack.pop()!;
    context.stack.push(this.slt(x, y));
    context.ip += this.bytes;
  }
}

export const Slt = new SltOp();
