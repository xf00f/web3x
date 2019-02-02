import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class MstoreOp implements OpCode {
  public readonly code = 0x52;
  public readonly mnemonic = 'MSTORE';
  public readonly description = 'Save word to memory';
  public readonly gas = 3;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const address = context.stack.pop()!;
    const value = context.stack.pop()!;
    context.memory.storeWord(address, value);
    context.ip += this.bytes;
  }
}

export const Mstore = new MstoreOp();
