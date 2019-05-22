import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class CodeSizeOp implements OpCode {
  public readonly code = 0x38;
  public readonly mnemonic = 'CODESIZE';
  public readonly description = 'Get size of current contract code in bytes';
  public readonly gas = 2;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    context.stack.push(BigInt(context.code.length));
    context.ip += this.bytes;
  }
}

export const CodeSize = new CodeSizeOp();
