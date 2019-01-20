import { OpCode } from '.';
import { EvmContext } from '../evm-context';

class LogOp implements OpCode {
  public readonly mnemonic: string;
  public readonly description: string;
  public readonly gas: number;
  public readonly bytes: number;

  constructor(readonly code: number, private topics: number) {
    this.bytes = 1;
    this.gas = 375 * (topics + 1);
    this.mnemonic = 'LOG' + topics;
    this.description = `Append log record with ${topics} topics`;
  }

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    for (let i = 0; i < this.topics + 2; i++) {
      context.stack.pop();
    }
    context.ip += this.bytes;
  }
}

export const Log0 = new LogOp(0xa0, 0);
export const Log1 = new LogOp(0xa1, 1);
export const Log2 = new LogOp(0xa2, 2);
export const Log3 = new LogOp(0xa3, 3);
export const Log4 = new LogOp(0xa4, 4);

export const LogOps = [Log1, Log2, Log3, Log4];
