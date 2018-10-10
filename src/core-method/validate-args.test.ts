import { Method } from '.';
import { errors } from '../core-helpers';

describe('core-method', () => {
  describe('validateArgs', function() {
    it('should pass', function() {
      // given
      var method = new Method({
        name: 'something',
        call: 'eth_something',
        params: 1,
      });

      var args = [1];
      var args2 = ['heloas'];

      // when
      var test = function() {
        method.validateArgs(args);
      };
      var test2 = function() {
        method.validateArgs(args2);
      };

      // then
      expect(test).not.toThrow();
      expect(test2).not.toThrow();
    });

    it('should return call based on args', function() {
      // given
      var method = new Method({
        name: 'something',
        call: 'eth_something',
        params: 2,
      });

      var args = [1];
      var args2 = ['heloas', '12', 3];

      // when
      var test = function() {
        method.validateArgs(args);
      };
      var test2 = function() {
        method.validateArgs(args2);
      };

      // then
      expect(test).toThrow(errors.InvalidNumberOfParams(1, 2, 'something'));
      expect(test2).toThrow(errors.InvalidNumberOfParams(3, 2, 'something'));
    });
  });
});
