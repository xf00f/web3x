import { EventEmitter } from 'events';
import { IRequestManager } from '.';

export class MockRequestManager implements IRequestManager {
  public send = jest.fn();
  public sendBatch = jest.fn();
  public addSubscription = jest.fn();
  public removeSubscription = jest.fn();
  public clearSubscriptions = jest.fn();
  public close = jest.fn();
  readonly provider = new EventEmitter();

  constructor() {
    this.addSubscription.mockImplementation((id, name, type, callback) => {
      this.provider.on(id, callback);
    });

    this.removeSubscription.mockImplementation((id, callback) => {
      this.send(
        {
          method: 'eth_unsubscribe',
          params: [id],
        },
        callback,
      );
      this.provider.removeAllListeners(id);
    });

    this.clearSubscriptions.mockImplementation(id => {
      this.provider.removeAllListeners();
    });
  }

  supportsSubscriptions() {
    return true;
  }
}
