import { toBufferBE } from 'bigint-buffer';
import { OpCode } from '.';
import { Address } from '../../address';
import { EvmContext } from '../evm-context';
import { EvmAccount } from '../world/evm-account';

class CallOp implements OpCode {
  public readonly code = 0xf1;
  public readonly mnemonic = 'CALL';
  public readonly description = 'Message-call into an account';
  public readonly gas = 0;
  public readonly bytes = 1;

  public toString(params: Buffer): string {
    return `${this.mnemonic}`;
  }

  public async handle(context: EvmContext) {
    const gas = context.stack.pop();
    const addr = context.stack.pop();
    const value = context.stack.pop();
    const inOffset = context.stack.pop();
    const inSize = context.stack.pop();
    const retOffset = context.stack.pop();
    const retSize = context.stack.pop();

    const { sender, executor, txSubstrate } = context;

    const address = new Address(toBufferBE(addr, 20));
    const account =
      txSubstrate.touchedAccounts[address.toString()] || (await EvmAccount.load(address, context.accounts));
    const calldata = context.memory.loadN(inOffset, Number(inSize));

    const callContext = await account.run(calldata, sender, executor, value, gas, txSubstrate);

    const hasErrored = callContext.reverted || !callContext.halt;
    if (hasErrored) {
      context.stack.push(BigInt(0));
    } else {
      context.stack.push(BigInt(1));

      context.memory.storeN(retOffset, callContext.returned.slice(0, Number(retSize)));
      context.lastReturned = callContext.returned;
    }

    context.ip += this.bytes;
  }
}

export const Call = new CallOp();
