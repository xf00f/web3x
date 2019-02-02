import { toBigIntBE } from 'bigint-buffer';
import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class CallDataLoadOp implements OpCode {
  public readonly code = 0x35;
  public readonly mnemonic = 'CALLDATALOAD';
  public readonly description = 'Get input data of current environment';
  public readonly gas = 3;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const offset = Number(context.stack.pop());
    const buf = Buffer.alloc(32);
    context.calldata.copy(buf, 0, offset, offset + 32);
    const word = toBigIntBE(buf);
    context.stack.push(word);
    context.ip += this.bytes;
  }
}

export const CallDataLoad = new CallDataLoadOp();
