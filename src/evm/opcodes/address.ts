import { toBigIntBE } from 'bigint-buffer';
import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class AddressOp implements OpCode {
  public readonly code = 0x30;
  public readonly mnemonic = 'ADDRESS';
  public readonly description = 'Get address of currently executing account';
  public readonly gas = 2;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    context.stack.push(toBigIntBE(context.executor.toBuffer()));
    context.ip += this.bytes;
  }
}

export const Address = new AddressOp();
