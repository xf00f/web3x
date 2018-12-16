export type EthereumProviderNotifications = 'notification' | 'connect' | 'close' | 'networkChanged' | 'accountsChanged';

export interface EthereumProvider {
  send(method: string, params?: any[]): Promise<any>;

  on(notification: 'notification', listener: (result: any) => void): this;
  on(notification: 'connect', listener: () => void): this;
  on(notification: 'close', listener: (code: number, reason: string) => void): this;
  on(notification: 'networkChanged', listener: (networkId: string) => void): this;
  on(notification: 'accountsChanged', listener: (accounts: string[]) => void): this;

  removeListener(notification: 'notification', listener: (result: any) => void): this;
  removeListener(notification: 'connect', listener: () => void): this;
  removeListener(notification: 'close', listener: (code: number, reason: string) => void): this;
  removeListener(notification: 'networkChanged', listener: (networkId: string) => void): this;
  removeListener(notification: 'accountsChanged', listener: (accounts: string[]) => void): this;

  removeAllListeners(notification: EthereumProviderNotifications);
}
