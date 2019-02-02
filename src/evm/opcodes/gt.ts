import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class GtOp implements OpCode {
  public readonly code = 0x11;
  public readonly mnemonic = 'GT';
  public readonly description = 'Greater-than comparison';
  public readonly gas = 3;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const v1 = context.stack.pop()!;
    const v2 = context.stack.pop()!;
    context.stack.push(v1 > v2 ? BigInt(1) : BigInt(0));
    context.ip += this.bytes;
  }
}

export const Gt = new GtOp();
