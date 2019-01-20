import { toBigIntBE, toBufferBE } from 'bigint-buffer';

export class EvmMemory {
  private memory: { [address: string]: number } = {};

  public loadByte(address: bigint) {
    return this.memory[address.toString(16)];
  }

  public loadN(address: bigint, length: number) {
    const data = new Uint8Array(length);
    for (let i = 0; i < length; ++i) {
      data[i] = this.memory[(address + BigInt(i)).toString(16)] || 0;
    }
    return Buffer.from(data);
  }

  public loadWord(address: bigint) {
    return toBigIntBE(this.loadN(address, 32));
  }

  public storeN(address: bigint, buffer: Buffer) {
    for (let i = 0; i < buffer.length; ++i) {
      this.memory[(address + BigInt(i)).toString(16)] = buffer[i];
    }
  }

  public storeWord(address: bigint, word: bigint) {
    const wordBuf = toBufferBE(word, 32);
    this.storeN(address, wordBuf);
  }
}
