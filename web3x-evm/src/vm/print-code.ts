/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { OpCodes } from '../opcodes';

export function printCode(code: Buffer) {
  let ip = 0;
  while (ip < code.length) {
    const byte = code[ip];
    const opCode = OpCodes[byte];

    if (!opCode) {
      // tslint:disable-next-line:no-console
      console.log(`Unknown opcode 0x${byte.toString(16)}`);
      ip += 1;
      continue;
    }

    const opCodeParams = code.slice(ip + 1, ip + opCode.bytes);

    // tslint:disable-next-line:no-console
    console.log(opCode.toString(opCodeParams));
    ip += opCode.bytes;
  }
}
