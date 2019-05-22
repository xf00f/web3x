import { toBigIntBE } from 'bigint-buffer';
import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class CallerOp implements OpCode {
  public readonly code = 0x33;
  public readonly mnemonic = 'CALLER';
  public readonly description = 'Get caller address';
  public readonly gas = 2;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    context.stack.push(toBigIntBE(context.caller.toBuffer()));
    context.ip += this.bytes;
  }
}

export const Caller = new CallerOp();
