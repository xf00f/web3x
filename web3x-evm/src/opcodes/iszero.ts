import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class IsZeroOp implements OpCode {
  public readonly code = 0x15;
  public readonly mnemonic = 'ISZERO';
  public readonly description = 'Simple not operator';
  public readonly gas = 3;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    context.stack.push(context.stack.pop()! === BigInt(0) ? BigInt(1) : BigInt(0));
    context.ip += this.bytes;
  }
}

export const IsZero = new IsZeroOp();
