import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class GasLimitOp implements OpCode {
  public readonly code = 0x45;
  public readonly mnemonic = 'GASLIMIT';
  public readonly description = 'Get the blocks gas limit.';
  public readonly gas = 1;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    context.stack.push(context.blockchainCtx.blockGasLimit);
    context.ip += this.bytes;
  }
}

export const GasLimit = new GasLimitOp();
