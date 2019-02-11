import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class ExpOp implements OpCode {
  public readonly code = 0x0a;
  public readonly mnemonic = 'EXP';
  public readonly description = 'Exponential operation';
  public readonly gas = 10;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const v1 = context.stack.pop()!;
    const v2 = context.stack.pop()!;
    context.stack.push(v1 ** v2 % BigInt(2) ** BigInt(256));
    context.ip += this.bytes;
  }
}

export const Exp = new ExpOp();
