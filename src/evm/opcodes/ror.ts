import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class RorOp implements OpCode {
  public readonly code = 0x1f;
  public readonly mnemonic = 'ROR';
  public readonly description = 'Bitwise rotate right';
  public readonly gas = 3;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const v1 = context.stack.pop()!;
    const v2 = context.stack.pop()!;
    context.stack.push((v2 >> v1) | (v2 << (BigInt(256) - v1)));
    context.ip += this.bytes;
  }
}

export const Ror = new RorOp();
