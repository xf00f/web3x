import { toBigIntBE, toBufferBE } from 'bigint-buffer';
import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class SloadOp implements OpCode {
  public readonly code = 0x54;
  public readonly mnemonic = 'SLOAD';
  public readonly description = 'Load word from storage';
  public readonly gas = 200;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public async handle(context: EvmContext) {
    const address = context.stack.pop()!;
    const value = await context.storage.get(toBufferBE(address, 32));
    context.stack.push(value ? toBigIntBE(value) : BigInt(0));
    context.ip += this.bytes;
  }
}

export const Sload = new SloadOp();
