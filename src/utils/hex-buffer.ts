import { isHexStrict } from './hex';

export function hexToBuffer(value: string) {
  if (!isHexStrict(value)) {
    throw new Error('Not a 0x formatted hex string');
  }
  return Buffer.from(value.slice(2), 'hex');
}

export function bufferToHex(value: Buffer) {
  return '0x' + value.toString('hex');
}
