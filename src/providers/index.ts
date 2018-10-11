export type Callback = (err?: Error, result?: JsonRPCResponse) => void;

export interface JsonRPCRequest {
  jsonrpc: string;
  method: string;
  params: any[];
  id: number;
}

export interface JsonRPCResponse {
  jsonrpc: string;
  id: number;
  result?: any;
  error?: string;
}

export type NotificationCallback = (result: any) => void;

export interface Provider {
  send(payload: JsonRPCRequest, callback: Callback): any;
  disconnect();
  on?(type: string, callback: NotificationCallback);
  removeListener?(type: string, callback: NotificationCallback);
  removeAllListeners?(type: string);
  reset?();
}

export { WebsocketProvider } from './ws';
export { HttpProvider } from './http';
export { IpcProvider } from './ipc';
