import { OpCode } from '.';
import { EvmContext } from '../evm-context';

class CallDataCopyOp implements OpCode {
  public readonly code = 0x37;
  public readonly mnemonic = 'CALLDATACOPY';
  public readonly description = 'Copy input data in current environment to memory';
  public readonly gas = 3;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public handle(context: EvmContext) {}
}

export const CallDataCopy = new CallDataCopyOp();
