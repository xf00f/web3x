import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class AddModOp implements OpCode {
  public readonly code = 0x08;
  public readonly mnemonic = 'ADDMOD';
  public readonly description = 'Modulo addition operation';
  public readonly gas = 8;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const v1 = context.stack.pop()!;
    const v2 = context.stack.pop()!;
    const v3 = context.stack.pop()!;
    if (v3 === BigInt(0)) {
      context.stack.push(BigInt(0));
    } else {
      context.stack.push((v1 + v2) % v3);
    }
    context.ip += this.bytes;
  }
}

export const AddMod = new AddModOp();
