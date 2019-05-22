import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class GasOp implements OpCode {
  public readonly code = 0x5a;
  public readonly mnemonic = 'GAS';
  public readonly description =
    'Get the amount of available gas, including the corresponding reduction for the cost of this instruction.';
  public readonly gas = 2;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    context.stack.push(context.availableGas);
    context.ip += this.bytes;
  }
}

export const Gas = new GasOp();
