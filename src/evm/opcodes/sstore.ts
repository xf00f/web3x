import { toBufferBE } from 'bigint-buffer';
import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class SstoreOp implements OpCode {
  public readonly code = 0x55;
  public readonly mnemonic = 'SSTORE';
  public readonly description = 'Store word in storage';
  public readonly gas = 20000;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public async handle(context: EvmContext) {
    const address = context.stack.pop()!;
    const value = context.stack.pop()!;
    await context.storage.put(toBufferBE(address, 32), toBufferBE(value, 32));
    context.ip += this.bytes;
  }
}

export const Sstore = new SstoreOp();
