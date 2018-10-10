import { sha3 } from './sha3';

describe('utils', function() {
  describe('sha3', function() {
    it('should return sha3 with hex prefix when hex input', function() {
      expect(sha3('test123')).toBe('0xf81b517a242b218999ec8eec0ea6e2ddbef2a367a14e93f4a32a39e260f686ad');
      expect(sha3('test(int)')).toBe('0xf4d03772bec1e62fbe8c5691e1a9101e520e8f8b5ca612123694632bf3cb51b1');
      expect(sha3('0x80')).toBe('0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421');
      expect(sha3('0x3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1')).toBe(
        '0x82ff40c0a986c6a5cfad4ddf4c3aa6996f1a7837f9c398e17e5de5cbd5a12b28',
      );
    });
  });
});
