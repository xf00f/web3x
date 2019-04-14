import { toBufferBE } from 'bigint-buffer';
import { OpCode } from '.';
import { EvmContext } from '../vm/evm-context';

class Mstore8Op implements OpCode {
  public readonly code = 0x53;
  public readonly mnemonic = 'MSTORE8';
  public readonly description = 'Save byte to memory';
  public readonly gas = 3;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {
    const [address, value] = context.stack.popN(2);
    context.memory.storeN(address, toBufferBE(value % BigInt(256), 1));
    context.ip += this.bytes;
  }
}

export const Mstore8 = new Mstore8Op();
