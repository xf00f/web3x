import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class CallDataSizeOp implements OpCode {
  public readonly code = 0x36;
  public readonly mnemonic = 'CALLDATASIZE';
  public readonly description = 'Get size of input data in current environment';
  public readonly gas = 2;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    context.stack.push(BigInt(context.calldata.length));
    context.ip += this.bytes;
  }
}

export const CallDataSize = new CallDataSizeOp();
