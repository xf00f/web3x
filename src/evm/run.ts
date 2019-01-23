import { EvmContext } from './evm-context';
import { OpCodes } from './opcodes';

export async function run(context: EvmContext, printOpcodes: boolean = false) {
  while (!context.halt) {
    const { code, ip } = context;
    const byte = code[context.ip];
    const opCode = OpCodes[byte];

    if (!opCode) {
      throw new Error(`Unknown opcode 0x${byte.toString(16)}`);
    }

    if (printOpcodes) {
      const opCodeParams = code.slice(ip + 1, ip + opCode.bytes);
      // tslint:disable-next-line:no-console
      console.log(opCode.toString(opCodeParams));
    }

    await opCode.handle(context);
  }

  if (context.reverted) {
    let instruction = 0;
    for (let bytes = 0; bytes < context.ip; ++instruction) {
      const { code } = context;
      const byte = code[bytes];
      const opCode = OpCodes[byte];
      if (!opCode) {
        throw new Error(`Unknown opcode 0x${byte.toString(16)}`);
      }
      bytes += opCode.bytes;
    }
    throw new Error(`Execution reverted at instruction ${instruction}.`);
  }

  return context;
}
