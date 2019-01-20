import { toBigIntBE } from 'bigint-buffer';
import { OpCode } from '.';
import { EvmContext } from '../evm-context';

class PushOp implements OpCode {
  public readonly mnemonic: string;
  public readonly description: string;
  public readonly gas = 3;
  public readonly bytes: number;

  constructor(readonly code: number, size: number) {
    this.bytes = size + 1;
    this.mnemonic = 'PUSH' + size;
    this.description = `Place ${size} byte item on stack`;
  }

  public toString(params: Buffer): string {
    return `${this.mnemonic} 0x${params.toString('hex')}`;
  }

  public handle(context: EvmContext) {
    const { code, stack, ip } = context;
    const toPush = toBigIntBE(code.slice(ip + 1, ip + this.bytes));
    stack.push(toPush);
    context.ip += this.bytes;
  }
}

export const Push1 = new PushOp(0x60, 1);
export const Push2 = new PushOp(0x61, 2);
export const Push3 = new PushOp(0x62, 3);
export const Push4 = new PushOp(0x63, 4);
export const Push5 = new PushOp(0x64, 5);
export const Push6 = new PushOp(0x65, 6);
export const Push7 = new PushOp(0x66, 7);
export const Push8 = new PushOp(0x67, 8);
export const Push9 = new PushOp(0x68, 9);
export const Push10 = new PushOp(0x69, 10);
export const Push11 = new PushOp(0x6a, 11);
export const Push12 = new PushOp(0x6b, 12);
export const Push13 = new PushOp(0x6c, 13);
export const Push14 = new PushOp(0x6d, 14);
export const Push15 = new PushOp(0x6e, 15);
export const Push16 = new PushOp(0x6f, 16);
export const Push17 = new PushOp(0x70, 17);
export const Push18 = new PushOp(0x71, 18);
export const Push19 = new PushOp(0x72, 19);
export const Push20 = new PushOp(0x73, 20);
export const Push21 = new PushOp(0x74, 21);
export const Push22 = new PushOp(0x75, 22);
export const Push23 = new PushOp(0x76, 23);
export const Push24 = new PushOp(0x77, 24);
export const Push25 = new PushOp(0x78, 25);
export const Push26 = new PushOp(0x79, 26);
export const Push27 = new PushOp(0x7a, 27);
export const Push28 = new PushOp(0x7b, 28);
export const Push29 = new PushOp(0x7c, 29);
export const Push30 = new PushOp(0x7d, 30);
export const Push31 = new PushOp(0x7e, 31);
export const Push32 = new PushOp(0x7f, 32);

export const PushOps = [
  Push1,
  Push2,
  Push3,
  Push4,
  Push5,
  Push6,
  Push7,
  Push8,
  Push9,
  Push10,
  Push11,
  Push12,
  Push13,
  Push14,
  Push15,
  Push16,
  Push17,
  Push18,
  Push19,
  Push20,
  Push21,
  Push22,
  Push23,
  Push24,
  Push25,
  Push26,
  Push27,
  Push28,
  Push29,
  Push30,
  Push31,
  Push32,
];
