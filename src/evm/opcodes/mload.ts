import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class MloadOp implements OpCode {
  public readonly code = 0x51;
  public readonly mnemonic = 'MLOAD';
  public readonly description = 'Load word from memory';
  public readonly gas = 3;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const address = context.stack.pop()!;
    context.stack.push(context.memory.loadWord(address));
    context.ip += this.bytes;
  }
}

export const Mload = new MloadOp();
