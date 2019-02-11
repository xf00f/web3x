import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class StopOp implements OpCode {
  public readonly code = 0x00;
  public readonly mnemonic = 'STOP';
  public readonly description = 'Halts execution';
  public readonly gas = 0;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    context.halt = true;
    context.ip += this.bytes;
  }
}

export const Stop = new StopOp();
