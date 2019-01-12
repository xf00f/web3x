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

const JsonRpc = {
  messageId: 0,
};

const validateSingleMessage = message =>
  !!message &&
  !message.error &&
  message.jsonrpc === '2.0' &&
  (typeof message.id === 'number' || typeof message.id === 'string') &&
  message.result !== undefined;

export interface JsonRpcRequest {
  jsonrpc: string;
  method: string;
  params: any[];
  id: number;
}

export interface JsonRpcResponse {
  jsonrpc: string;
  id: number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

/**
 * Should be called to valid json create payload object
 */
export function createJsonRpcPayload(method: string, params?: any[]): JsonRpcRequest {
  JsonRpc.messageId++;

  return {
    jsonrpc: '2.0',
    id: JsonRpc.messageId,
    method,
    params: params || [],
  };
}

/**
 * Should be called to check if jsonrpc response is valid
 */
export function isValidJsonRpcResponse(response: any) {
  return Array.isArray(response) ? response.every(validateSingleMessage) : validateSingleMessage(response);
}

/**
 * Should be called to create batch payload object
 */
export function createJsonRpcBatchPayload(messages: { method: string; params?: any[] }[]) {
  return messages.map(message => createJsonRpcPayload(message.method, message.params));
}
