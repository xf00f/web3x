import { inputBlockNumberFormatter } from '../formatters';

const tests = [
  { value: 'genesis', expected: '0x0' },
  { value: 'latest', expected: 'latest' },
  { value: 'pending', expected: 'pending' },
  { value: 'earliest', expected: '0x0' },
  { value: 1, expected: '0x1' },
  { value: '0x1', expected: '0x1' },
];

describe('core-helpers', () => {
  describe('formatters', () => {
    describe('inputDefaultBlockNumberFormatter', function() {
      tests.forEach(function(test) {
        it('should turn ' + test.value + ' to ' + test.expected, function() {
          expect(inputBlockNumberFormatter(test.value)).toBe(test.expected);
        });
      });
    });
  });
});
