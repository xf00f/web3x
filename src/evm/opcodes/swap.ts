import { OpCode } from '.';
import { EvmContext } from '../evm-context';

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
    const v1 = stack[stack.length - 1];
    const v2 = stack[stack.length - (this.position + 1)];
    stack[stack.length - 1] = v2;
    stack[stack.length - (this.position + 1)] = v1;
    context.ip += this.bytes;
  }
}

export const Swap1 = new SwapOp(0x90, 1);
export const Swap2 = new SwapOp(0x91, 2);
export const Swap3 = new SwapOp(0x92, 3);
export const Swap4 = new SwapOp(0x93, 4);
export const Swap5 = new SwapOp(0x94, 5);
export const Swap6 = new SwapOp(0x95, 6);
export const Swap7 = new SwapOp(0x96, 7);
export const Swap8 = new SwapOp(0x97, 8);
export const Swap9 = new SwapOp(0x98, 9);
export const Swap10 = new SwapOp(0x99, 10);
export const Swap11 = new SwapOp(0x9a, 11);
export const Swap12 = new SwapOp(0x9b, 12);
export const Swap13 = new SwapOp(0x9c, 13);
export const Swap14 = new SwapOp(0x9d, 14);
export const Swap15 = new SwapOp(0x9e, 15);
export const Swap16 = new SwapOp(0x9f, 16);

export const SwapOps = [
  Swap1,
  Swap2,
  Swap3,
  Swap4,
  Swap5,
  Swap6,
  Swap7,
  Swap8,
  Swap9,
  Swap10,
  Swap11,
  Swap12,
  Swap13,
  Swap14,
  Swap15,
  Swap16,
];
