import { EvmContext } from './evm-context';
import { OpCodes } from './opcodes';

export async function run(context: EvmContext) {
  while (!context.halt) {
    const { code, ip } = context;
    const byte = code[context.ip];
    const opCode = OpCodes[byte];

    if (!opCode) {
      throw new Error(`Unknown opcode 0x${byte.toString(16)}`);
    }

    const opCodeParams = code.slice(ip + 1, ip + opCode.bytes);
    // console.log(opCode.toString(opCodeParams));

    await opCode.handle(context);
  }

  return context.returned;
}
