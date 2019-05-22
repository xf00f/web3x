import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class MulModOp implements OpCode {
  public readonly code = 0x09;
  public readonly mnemonic = 'MULMOD';
  public readonly description = 'Modulo multiplication operation';
  public readonly gas = 5;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const v1 = context.stack.pop()!;
    const v2 = context.stack.pop()!;
    const v3 = context.stack.pop()!;
    context.stack.push(v3 === BigInt(0) ? BigInt(0) : ((v1 * v2) % v3) % BigInt(2) ** BigInt(256));
    context.ip += this.bytes;
  }
}

export const MulMod = new MulModOp();
