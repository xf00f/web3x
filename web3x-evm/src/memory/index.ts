import { toBigIntBE, toBufferBE } from 'bigint-buffer';

export class EvmMemory {
  private activeWords: bigint = BigInt(0);
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
      const byteAddr = address + BigInt(i);
      this.memory[byteAddr.toString(16)] = buffer[i];
    }
    const topAddr = address + BigInt(buffer.length - 1);
    const wordNumber = ((topAddr - (topAddr % BigInt(32))) >> BigInt(5)) + BigInt(1);
    this.activeWords = wordNumber > this.activeWords ? wordNumber : this.activeWords;
  }

  public storeWord(address: bigint, word: bigint) {
    const wordBuf = toBufferBE(word, 32);
    this.storeN(address, wordBuf);
  }

  public activeMemoryWords() {
    return this.activeWords;
  }
}
