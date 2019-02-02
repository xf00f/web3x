import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class EqOp implements OpCode {
  public readonly code = 0x14;
  public readonly mnemonic = 'EQ';
  public readonly description = 'Equality comparison';
  public readonly gas = 3;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const v1 = context.stack.pop()!;
    const v2 = context.stack.pop()!;
    context.stack.push(v1 === v2 ? BigInt(1) : BigInt(0));
    context.ip += this.bytes;
  }
}

export const Eq = new EqOp();
