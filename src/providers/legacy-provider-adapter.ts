import { EventEmitter } from 'events';
import { EthereumProvider, EthereumProviderNotifications } from './ethereum-provider';
import { createJsonRpcPayload, isValidJsonRpcResponse, JsonRpcResponse } from './jsonrpc';
import { LegacyProvider } from './legacy-provider';

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

  public send(method: string, params?: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const payload = createJsonRpcPayload(method, params);

      this.provider.send(payload, (err, message) => {
        if (err) {
          return reject(err);
        }
        if (!message) {
          return reject(new Error('No response.'));
        }
        if (!isValidJsonRpcResponse(message)) {
          const msg =
            message.error && message.error.message
              ? message.error.message
              : 'Invalid JSON RPC response: ' + JSON.stringify(message);
          return reject(new Error(msg));
        }
        const response = message as JsonRpcResponse;

        if (response.error) {
          const message = response.error.message ? response.error.message : JSON.stringify(response);
          return reject(new Error('Returned error: ' + message));
        }
        if (response.id && payload.id !== response.id) {
          return reject(new Error(`Wrong response id ${payload.id} != ${response.id} in ${JSON.stringify(payload)}`));
        }

        resolve(response.result);
      });
    });
  }

  public on(notification: 'notification', listener: (result: any) => void): this;
  public on(notification: 'connect', listener: () => void): this;
  public on(notification: 'close', listener: (code: number, reason: string) => void): this;
  public on(notification: 'networkChanged', listener: (networkId: string) => void): this;
  public on(notification: 'accountsChanged', listener: (accounts: string[]) => void): this;
  public on(notification: EthereumProviderNotifications, listener: (...args: any[]) => void): this {
    if (notification !== 'notification') {
      throw new Error('Legacy providers only support notification event.');
    }
    if (this.eventEmitter.listenerCount('notification') === 0) {
      this.subscribeToLegacyProvider();
    }
    this.eventEmitter.on('notification', listener);
    return this;
  }

  public removeListener(notification: 'notification', listener: (result: any) => void): this;
  public removeListener(notification: 'connect', listener: () => void): this;
  public removeListener(notification: 'close', listener: (code: number, reason: string) => void): this;
  public removeListener(notification: 'networkChanged', listener: (networkId: string) => void): this;
  public removeListener(notification: 'accountsChanged', listener: (accounts: string[]) => void): this;
  public removeListener(notification: EthereumProviderNotifications, listener: (...args: any[]) => void): this {
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

  public removeAllListeners(notification: EthereumProviderNotifications) {
    this.eventEmitter.removeAllListeners('notification');
    if (this.provider.removeAllListeners) {
      this.provider.removeAllListeners('data');
    }
  }
}
