import * as Jsonrpc from './jsonrpc';

describe('jsonrpc', function() {
  describe('isValidResponse', function() {
    it('should validate basic jsonrpc response', function() {
      const response = {
        jsonrpc: '2.0',
        id: 1,
        result: [],
      };

      const valid = Jsonrpc.isValidResponse(response);

      expect(valid).toBe(true);
    });

    it('should validate basic undefined response', function() {
      const response = undefined;

      const valid = Jsonrpc.isValidResponse(response);

      expect(valid).toBe(false);
    });

    it('should validate jsonrpc response without jsonrpc field', function() {
      const response = {
        id: 1,
        result: [],
      };

      const valid = Jsonrpc.isValidResponse(response);

      expect(valid).toBe(false);
    });

    it('should validate jsonrpc response with wrong jsonrpc version', function() {
      const response = {
        jsonrpc: '1.0',
        id: 1,
        result: [],
      };

      const valid = Jsonrpc.isValidResponse(response);

      expect(valid).toBe(false);
    });

    it('should validate jsonrpc response without id number', function() {
      const response = {
        jsonrpc: '2.0',
        result: [],
      };

      const valid = Jsonrpc.isValidResponse(response);

      expect(valid).toBe(false);
    });

    it('should validate jsonrpc response with string id field', function() {
      const response = {
        jsonrpc: '2.0',
        id: 'x',
        result: [],
      };

      const valid = Jsonrpc.isValidResponse(response);

      expect(valid).toBe(true);
    });

    it('should validate jsonrpc response with string id field but as number', function() {
      const response = {
        jsonrpc: '2.0',
        id: '23',
        result: [],
      };

      const valid = Jsonrpc.isValidResponse(response);

      expect(valid).toBe(true);
    });

    it('should validate jsonrpc response without result field', function() {
      const response = {
        jsonrpc: '2.0',
        id: 1,
      };

      const valid = Jsonrpc.isValidResponse(response);

      expect(valid).toBe(false);
    });

    it('should validate jsonrpc response with result field === false', function() {
      const response = {
        jsonrpc: '2.0',
        id: 1,
        result: false,
      };

      const valid = Jsonrpc.isValidResponse(response);

      expect(valid).toBe(true);
    });

    it('should validate jsonrpc response with result field === 0', function() {
      const response = {
        jsonrpc: '2.0',
        id: 1,
        result: 0,
      };

      const valid = Jsonrpc.isValidResponse(response);

      expect(valid).toBe(true);
    });
  });

  describe('id', function() {
    it('should increment the id', function() {
      const method = 'm';

      const p1 = Jsonrpc.toPayload(method);
      const p2 = Jsonrpc.toPayload(method);

      expect(p2.id).toBe(p1.id + 1);
    });
  });

  describe('toBatchPayload', function() {
    it('should create basic batch payload', function() {
      // given
      const messages = [
        {
          method: 'helloworld',
        },
        {
          method: 'test2',
          params: [1],
        },
      ];

      // when
      const payload = Jsonrpc.toBatchPayload(messages);

      // then
      expect(Array.isArray(payload)).toBe(true);
      expect(payload.length).toBe(2);
      expect(payload[0].jsonrpc).toBe('2.0');
      expect(payload[1].jsonrpc).toBe('2.0');
      expect(payload[0].method).toBe('helloworld');
      expect(payload[1].method).toBe('test2');
      expect(Array.isArray(payload[0].params)).toBe(true);
      expect(payload[1].params.length).toBe(1);
      expect(payload[1].params[0]).toBe(1);
      expect(typeof payload[0].id).toBe('number');
      expect(typeof payload[1].id).toBe('number');
      expect(payload[0].id + 1).toBe(payload[1].id);
    });

    it('should create batch payload for empty input array', function() {
      // given
      const messages = [];

      // when
      const payload = Jsonrpc.toBatchPayload(messages);

      // then
      expect(Array.isArray(payload)).toBe(true);
      expect(payload.length).toBe(0);
    });
  });

  describe('toPayload', function() {
    it('should create basic payload', function() {
      // given
      const method = 'helloworld';

      // when
      const payload = Jsonrpc.toPayload(method);

      // then
      expect(payload.jsonrpc).toBe('2.0');
      expect(payload.method).toBe(method);
      expect(Array.isArray(payload.params)).toBe(true);
      expect(payload.params.length).toBe(0);
      expect(typeof payload.id).toBe('number');
    });

    it('should create payload with params', function() {
      // given
      const method = 'helloworld1';
      const params = [123, 'test'];

      // when
      const payload = Jsonrpc.toPayload(method, params);

      // then
      expect(payload.jsonrpc).toBe('2.0');
      expect(payload.method).toBe(method);
      expect(payload.params.length).toBe(2);
      expect(payload.params[0]).toBe(params[0]);
      expect(payload.params[1]).toBe(params[1]);
      expect(typeof payload.id).toBe('number');
    });
  });
});
