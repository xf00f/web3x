import { fromWei, toWei } from './units';

describe('utils', function() {
  describe('fromWei', function() {
    it('should return the correct value', function() {
      expect(fromWei('1000000000000000000', 'wei')).toBe('1000000000000000000');
      expect(fromWei('1000000000000000000', 'kwei')).toBe('1000000000000000');
      expect(fromWei('1000000000000000000', 'mwei')).toBe('1000000000000');
      expect(fromWei('1000000000000000000', 'gwei')).toBe('1000000000');
      expect(fromWei('1000000000000000000', 'szabo')).toBe('1000000');
      expect(fromWei('1000000000000000000', 'finney')).toBe('1000');
      expect(fromWei('1000000000000000000', 'ether')).toBe('1');
      expect(fromWei('1000000000000000000', 'kether')).toBe('0.001');
      expect(fromWei('1000000000000000000', 'grand')).toBe('0.001');
      expect(fromWei('1000000000000000000', 'mether')).toBe('0.000001');
      expect(fromWei('1000000000000000000', 'gether')).toBe('0.000000001');
      expect(fromWei('1000000000000000000', 'tether')).toBe('0.000000000001');
    });
  });

  describe('toWei', function() {
    it('should return the correct value', function() {
      expect(toWei('1', 'wei')).toBe('1');
      expect(toWei('1', 'kwei')).toBe('1000');
      expect(toWei('1', 'Kwei')).toBe('1000');
      expect(toWei('1', 'babbage')).toBe('1000');
      expect(toWei('1', 'mwei')).toBe('1000000');
      expect(toWei('1', 'Mwei')).toBe('1000000');
      expect(toWei('1', 'lovelace')).toBe('1000000');
      expect(toWei('1', 'gwei')).toBe('1000000000');
      expect(toWei('1', 'Gwei')).toBe('1000000000');
      expect(toWei('1', 'shannon')).toBe('1000000000');
      expect(toWei('1', 'szabo')).toBe('1000000000000');
      expect(toWei('1', 'finney')).toBe('1000000000000000');
      expect(toWei('1', 'ether')).toBe('1000000000000000000');
      expect(toWei('1', 'kether')).toBe('1000000000000000000000');
      expect(toWei('1', 'grand')).toBe('1000000000000000000000');
      expect(toWei('1', 'mether')).toBe('1000000000000000000000000');
      expect(toWei('1', 'gether')).toBe('1000000000000000000000000000');
      expect(toWei('1', 'tether')).toBe('1000000000000000000000000000000');

      expect(toWei('1', 'kwei')).toBe(toWei('1', 'femtoether'));
      expect(toWei('1', 'szabo')).toBe(toWei('1', 'microether'));
      expect(toWei('1', 'finney')).toBe(toWei('1', 'milliether'));
      expect(toWei('1', 'milli')).toBe(toWei('1', 'milliether'));
      expect(toWei('1', 'milli')).toBe(toWei('1000', 'micro'));
    });
  });
});
