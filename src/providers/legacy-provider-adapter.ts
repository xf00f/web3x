import { EthereumProvider, EthereumProviderNotifications } from './ethereum-provider';
import { LegacyProvider } from './legacy-provider';
import { createJsonRpcPayload, isValidJsonRpcResponse, JsonRpcResponse } from './jsonrpc';
import { ErrorResponse, InvalidResponse } from '../errors';
import { EventEmitter } from 'events';

export class LegacyProviderAdapter implements EthereumProvider {
  private eventEmitter = new EventEmitter();

  constructor(private provider: LegacyProvider) {}

  private subscribeToLegacyProvider() {
    if (!this.provider.on) {
      throw new Error('Legacy provider does not support subscriptions.');
    }
    this.provider.on('data', (result: any, deprecatedResult?: any) => {
      result = result || deprecatedResult;
      if (!result.method) {
        return;
      }

      this.eventEmitter.emit('notification', result.params);
    });
  }

  send(method: string, params?: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const payload = createJsonRpcPayload(method, params);

      this.provider.send(payload, function(err, message) {
        if (err) {
          return reject(err);
        }
        if (!isValidJsonRpcResponse(message)) {
          return reject(InvalidResponse(message));
        }
        const response = message as JsonRpcResponse;

        if (response.error) {
          return reject(ErrorResponse(message));
        }
        if (response.id && payload.id !== response.id) {
          return reject(new Error(`Wrong response id ${payload.id} != ${response.id} in ${JSON.stringify(payload)}`));
        }

        resolve(response.result);
      });
    });
  }

  on(notification: 'notification', listener: (result: any) => void): this;
  on(notification: 'connect', listener: () => void): this;
  on(notification: 'close', listener: (code: number, reason: string) => void): this;
  on(notification: 'networkChanged', listener: (networkId: string) => void): this;
  on(notification: 'accountsChanged', listener: (accounts: string[]) => void): this;
  on(notification: EthereumProviderNotifications, listener: (...args: any[]) => void): this {
    if (notification !== 'notification') {
      throw new Error('Legacy providers only support notification event.');
    }
    if (this.eventEmitter.listenerCount('notification') === 0) {
      this.subscribeToLegacyProvider();
    }
    this.eventEmitter.on('notification', listener);
    return this;
  }

  removeListener(notification: 'notification', listener: (result: any) => void): this;
  removeListener(notification: 'connect', listener: () => void): this;
  removeListener(notification: 'close', listener: (code: number, reason: string) => void): this;
  removeListener(notification: 'networkChanged', listener: (networkId: string) => void): this;
  removeListener(notification: 'accountsChanged', listener: (accounts: string[]) => void): this;
  removeListener(notification: EthereumProviderNotifications, listener: (...args: any[]) => void): this {
    if (!this.provider.removeListener) {
      throw new Error('Legacy provider does not support subscriptions.');
    }
    if (notification !== 'notification') {
      throw new Error('Legacy providers only support notification event.');
    }
    this.eventEmitter.removeListener('notification', listener);
    if (this.eventEmitter.listenerCount('notification') === 0) {
      this.provider.removeAllListeners!('data');
    }
    return this;
  }

  removeAllListeners(notification: EthereumProviderNotifications) {
    this.eventEmitter.removeAllListeners('notification');
    if (this.provider.removeAllListeners) {
      this.provider.removeAllListeners('data');
    }
  }
}
