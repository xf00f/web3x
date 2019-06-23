import { bufferToHex, hexToBuffer } from './hex-buffer';

describe('utils', () => {
  describe('hex-buffer', () => {
    it('should correctly convert odd length hex', () => {
      expect(hexToBuffer('0x123')).toEqual(Buffer.from('0123', 'hex'));
    });

    it('should correctly convert buffer to hex', () => {
      expect(bufferToHex(Buffer.from('0123', 'hex'))).toEqual('0x0123');
    });
  });
});
