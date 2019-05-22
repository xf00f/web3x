import { OpCodes } from '../opcodes';
import { EvmContext } from './evm-context';

export async function run(context: EvmContext, printOpcodes: boolean = false) {
  try {
    while (!context.halt) {
      const { code, ip } = context;

      if (ip >= code.length) {
        break;
      }

      const byte = code[ip];
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
  } catch (err) {
    context.error = err;
    context.halt = true;
    context.reverted = true;
  }

  if (context.reverted) {
    let instruction = 0;
    for (let bytes = 0; bytes < context.ip; ++instruction) {
      const { code } = context;
      const byte = code[bytes];
      const opCode = OpCodes[byte];
      bytes += opCode ? opCode.bytes : 1;
    }
    context.revertInstruction = instruction;
    if (context.error) {
      context.error.message += ` (instruction ${instruction})`;
    } else {
      context.error = new Error(`Reverted at instruction ${instruction}`);
    }
  }

  return context;
}
