import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class TimestampOp implements OpCode {
  public readonly code = 0x42;
  public readonly mnemonic = 'TIMESTAMP';
  public readonly description = 'Get the blocks timestamp.';
  public readonly gas = 1;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    // TODO: This is not right.
    context.stack.push(BigInt(new Date().getTime()));
    context.ip += this.bytes;
  }
}

export const Timestamp = new TimestampOp();
