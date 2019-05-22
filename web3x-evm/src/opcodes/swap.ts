import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class SwapOp implements OpCode {
  public readonly mnemonic: string;
  public readonly description: string;
  public readonly gas = 3;
  public readonly bytes: number;

  constructor(readonly code: number, private position: number) {
    this.bytes = 1;
    this.mnemonic = 'SWAP' + position;
    this.description = `Swap 1st stack item with stack item ${position}`;
  }

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const { stack } = context;
    if (stack.length < this.position + 1) {
      throw new Error('Not enough stack items for swap.');
    }
    const v1 = stack[stack.length - 1];
    const v2 = stack[stack.length - (this.position + 1)];
    stack[stack.length - 1] = v2;
    stack[stack.length - (this.position + 1)] = v1;
    context.ip += this.bytes;
  }
}

export const SwapOps = new Array(16).fill(0).map((_, i) => new SwapOp(0x90 + i, i + 1));
