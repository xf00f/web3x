import { toBufferBE } from 'bigint-buffer';
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
    context.stack.pop();
    context.stack.pop();
    const args: string[] = [];
    for (let i = 0; i < this.topics; i++) {
      args.push(toBufferBE(context.stack.pop(), 32).toString('hex'));
    }
    // console.log(`${this.mnemonic}: ${args}`);
    context.ip += this.bytes;
  }
}

export const LogOps = new Array(5).fill(0).map((_, i) => new LogOp(0xa0 + i, i));
