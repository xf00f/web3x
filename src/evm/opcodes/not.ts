import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class NotOp implements OpCode {
  public readonly code = 0x19;
  public readonly mnemonic = 'NOT';
  public readonly description = 'Bitwise NOT operation';
  public readonly gas = 3;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const v1 = context.stack.pop()!;
    context.stack.push(~v1);
    context.ip += this.bytes;
  }
}

export const Not = new NotOp();
