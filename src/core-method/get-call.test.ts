import { Method } from '.';

describe('core-method', () => {
  describe('getCall', () => {
    it('should return call name', () => {
      // given
      var call = 'hello_call_world';
      var method = new Method({
        name: 'something',
        call: call,
      });

      // when
      var result = method.getCall();

      // then
      expect(call).toEqual(result);
    });

    it('should return call based on args', function() {
      // given
      var call = function(args) {
        return args ? args.length.toString() : '0';
      };

      var method = new Method({
        name: 'something',
        call: call,
      });

      // when
      var r0 = method.getCall();
      var r1 = method.getCall([1]);
      var r2 = method.getCall([1, 2]);

      // then
      expect(r0).toBe('0');
      expect(r1).toBe('1');
      expect(r2).toBe('2');
    });
  });
});
