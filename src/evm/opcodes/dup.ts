import { OpCode } from '.';
import { EvmContext } from '../evm-context';

class DupOp implements OpCode {
  public readonly mnemonic: string;
  public readonly description: string;
  public readonly gas = 3;
  public readonly bytes: number;

  constructor(readonly code: number, private position: number) {
    this.bytes = 1;
    this.mnemonic = 'DUP' + position;
    this.description = `Duplicate stack item ${position}`;
  }

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const { stack } = context;
    stack.push(stack[stack.length - this.position]);
    context.ip += this.bytes;
  }
}

export const Dup1 = new DupOp(0x80, 1);
export const Dup2 = new DupOp(0x81, 2);
export const Dup3 = new DupOp(0x82, 3);
export const Dup4 = new DupOp(0x83, 4);
export const Dup5 = new DupOp(0x84, 5);
export const Dup6 = new DupOp(0x85, 6);
export const Dup7 = new DupOp(0x86, 7);
export const Dup8 = new DupOp(0x87, 8);
export const Dup9 = new DupOp(0x88, 9);
export const Dup10 = new DupOp(0x89, 10);
export const Dup11 = new DupOp(0x8a, 11);
export const Dup12 = new DupOp(0x8b, 12);
export const Dup13 = new DupOp(0x8c, 13);
export const Dup14 = new DupOp(0x8d, 14);
export const Dup15 = new DupOp(0x8e, 15);
export const Dup16 = new DupOp(0x8f, 16);

export const DupOps = [
  Dup1,
  Dup2,
  Dup3,
  Dup4,
  Dup5,
  Dup6,
  Dup7,
  Dup8,
  Dup9,
  Dup10,
  Dup11,
  Dup12,
  Dup13,
  Dup14,
  Dup15,
  Dup16,
];
