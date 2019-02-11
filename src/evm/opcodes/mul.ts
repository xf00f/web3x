import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class MulOp implements OpCode {
  public readonly code = 0x02;
  public readonly mnemonic = 'MUL';
  public readonly description = 'Multiplication operation';
  public readonly gas = 5;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const v1 = context.stack.pop()!;
    const v2 = context.stack.pop()!;
    context.stack.push((v1 * v2) % BigInt(2) ** BigInt(256));
    context.ip += this.bytes;
  }
}

export const Mul = new MulOp();
