import { toBigIntBE, toBufferBE } from 'bigint-buffer';
import BN from 'bn.js';
import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

const TWO_POW256 = new BN('10000000000000000000000000000000000000000000000000000000000000000', 16);

class ExpOp implements OpCode {
  public readonly code = 0x0a;
  public readonly mnemonic = 'EXP';
  public readonly description = 'Exponential operation';
  public readonly gas = 10;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const [base, exponent] = context.stack.popN(2);

    const m = BN.red(TWO_POW256);
    const bnBase = new BN(toBufferBE(base, 32)).toRed(m);
    const r = bnBase.redPow(new BN(toBufferBE(exponent, 32)));

    context.stack.push(toBigIntBE(r.toBuffer('be', 32)));
    context.ip += this.bytes;
  }
}

/*
function pow(a: bigint, num: bigint) {
  if (num === BigInt(0)) {
    return BigInt(1);
  }
  if (num === BigInt(1)) {
    return num;
  }

  const windowSize = 4;
  const wnd: bigint[] = new Array(1 << windowSize);
  wnd[0] = BigInt(1);
  wnd[1] = a;
  for (let i = 2; i < wnd.length; i++) {
    wnd[i] = wnd[i - 1] * a;
  }

  let res = wnd[0];
  let current = 0;
  let currentLen = 0;
  let start = num.toString(2).length % 26;
  if (start === 0) {
    start = 26;
  }

  for (let i = num.length - 1; i >= 0; i--) {
    let word = num.words[i];
    for (let j = start - 1; j >= 0; j--) {
      let bit = (word >> j) & 1;
      if (res !== wnd[0]) {
        res = this.sqr(res);
      }

      if (bit === 0 && current === 0) {
        currentLen = 0;
        continue;
      }

      current <<= 1;
      current |= bit;
      currentLen++;
      if (currentLen !== windowSize && (i !== 0 || j !== 0)) {
        continue;
      }

      res = res * wnd[current];
      currentLen = 0;
      current = 0;
    }
    start = 26;
  }

  return res;
}
*/

export const Exp = new ExpOp();
