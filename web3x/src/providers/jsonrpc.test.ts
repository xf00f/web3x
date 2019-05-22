/*
  This file is part of web3x.

  web3x is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  web3x is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License
  along with web3x.  If not, see <http://www.gnu.org/licenses/>.
*/

import { createJsonRpcBatchPayload, createJsonRpcPayload, isValidJsonRpcResponse } from './jsonrpc';

describe('jsonrpc', () => {
  describe('isValidResponse', () => {
    it('should validate basic jsonrpc response', () => {
      const response = {
        jsonrpc: '2.0',
        id: 1,
        result: [],
      };

      const valid = isValidJsonRpcResponse(response);

      expect(valid).toBe(true);
    });

    it('should validate basic undefined response', () => {
      const response = undefined;

      const valid = isValidJsonRpcResponse(response);

      expect(valid).toBe(false);
    });

    it('should validate jsonrpc response without jsonrpc field', () => {
      const response = {
        id: 1,
        result: [],
      };

      const valid = isValidJsonRpcResponse(response);

      expect(valid).toBe(false);
    });

    it('should validate jsonrpc response with wrong jsonrpc version', () => {
      const response = {
        jsonrpc: '1.0',
        id: 1,
        result: [],
      };

      const valid = isValidJsonRpcResponse(response);

      expect(valid).toBe(false);
    });

    it('should validate jsonrpc response without id number', () => {
      const response = {
        jsonrpc: '2.0',
        result: [],
      };

      const valid = isValidJsonRpcResponse(response);

      expect(valid).toBe(false);
    });

    it('should validate jsonrpc response with string id field', () => {
      const response = {
        jsonrpc: '2.0',
        id: 'x',
        result: [],
      };

      const valid = isValidJsonRpcResponse(response);

      expect(valid).toBe(true);
    });

    it('should validate jsonrpc response with string id field but as number', () => {
      const response = {
        jsonrpc: '2.0',
        id: '23',
        result: [],
      };

      const valid = isValidJsonRpcResponse(response);

      expect(valid).toBe(true);
    });

    it('should validate jsonrpc response without result field', () => {
      const response = {
        jsonrpc: '2.0',
        id: 1,
      };

      const valid = isValidJsonRpcResponse(response);

      expect(valid).toBe(false);
    });

    it('should validate jsonrpc response with result field === false', () => {
      const response = {
        jsonrpc: '2.0',
        id: 1,
        result: false,
      };

      const valid = isValidJsonRpcResponse(response);

      expect(valid).toBe(true);
    });

    it('should validate jsonrpc response with result field === 0', () => {
      const response = {
        jsonrpc: '2.0',
        id: 1,
        result: 0,
      };

      const valid = isValidJsonRpcResponse(response);

      expect(valid).toBe(true);
    });
  });

  describe('id', () => {
    it('should increment the id', () => {
      const method = 'm';

      const p1 = createJsonRpcPayload(method);
      const p2 = createJsonRpcPayload(method);

      expect(p2.id).toBe(p1.id + 1);
    });
  });

  describe('toBatchPayload', () => {
    it('should create basic batch payload', () => {
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
      const payload = createJsonRpcBatchPayload(messages);

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

    it('should create batch payload for empty input array', () => {
      // given
      const messages = [];

      // when
      const payload = createJsonRpcBatchPayload(messages);

      // then
      expect(Array.isArray(payload)).toBe(true);
      expect(payload.length).toBe(0);
    });
  });

  describe('toPayload', () => {
    it('should create basic payload', () => {
      // given
      const method = 'helloworld';

      // when
      const payload = createJsonRpcPayload(method);

      // then
      expect(payload.jsonrpc).toBe('2.0');
      expect(payload.method).toBe(method);
      expect(Array.isArray(payload.params)).toBe(true);
      expect(payload.params.length).toBe(0);
      expect(typeof payload.id).toBe('number');
    });

    it('should create payload with params', () => {
      // given
      const method = 'helloworld1';
      const params = [123, 'test'];

      // when
      const payload = createJsonRpcPayload(method, params);

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
