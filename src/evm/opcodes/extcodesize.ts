import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class ExtCodeSizeOp implements OpCode {
  public readonly code = 0x3b;
  public readonly mnemonic = 'EXTCODESIZE';
  public readonly description = 'Get size of an accounts code';
  public readonly gas = 700;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public async handle(context: EvmContext) {
    const address = context.stack.pop() % BigInt(2) ** BigInt(160);
    const account = await context.worldState.loadAccount(address);
    context.stack.push(BigInt(account!.code.length));
    context.ip += this.bytes;
  }
}

export const ExtCodeSize = new ExtCodeSizeOp();
