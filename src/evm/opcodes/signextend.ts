import { toBigIntBE, toBufferBE } from 'bigint-buffer';
import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class SignExtendOp implements OpCode {
  public readonly code = 0x0b;
  public readonly mnemonic = 'SIGNEXTEND';
  public readonly description = 'Sign extend twos complement number';
  public readonly gas = 3;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const [k, val] = context.stack.popN(2);
    const valArr = [...toBufferBE(val, 32)];
    let extendOnes = false;

    if (k <= 31) {
      if (valArr[31 - Number(k)] & 0x80) {
        extendOnes = true;
      }

      // 31-k-1 since k-th byte shouldn't be modified
      for (let i = 30 - Number(k); i >= 0; i--) {
        valArr[i] = extendOnes ? 0xff : 0;
      }
    }

    context.stack.push(toBigIntBE(Buffer.from(valArr)));
    context.ip += this.bytes;
  }
}

export const SignExtend = new SignExtendOp();
