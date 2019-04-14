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
    const nip = Number(context.stack.pop());
    if (OpCodes[context.code[nip]].mnemonic !== 'JUMPDEST') {
      throw new Error('Invalid jump destination.');
    }
    context.ip = nip;
  }
}

export const Jump = new JumpOp();
