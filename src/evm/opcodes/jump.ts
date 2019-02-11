import { OpCode, OpCodes } from '.';
import { EvmContext } from '../vm/evm-context';

class JumpOp implements OpCode {
  public readonly code = 0x56;
  public readonly mnemonic = 'JUMP';
  public readonly description = 'Alter the program counter';
  public readonly gas = 8;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    context.ip = +context.stack.pop()!.toString();
    if (OpCodes[context.code[context.ip]].mnemonic !== 'JUMPDEST') {
      throw new Error('Invalid jump destination.');
    }
  }
}

export const Jump = new JumpOp();
