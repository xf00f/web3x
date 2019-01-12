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

import Ws, { ClientOptions } from 'isomorphic-ws';
import { isArray } from 'util';
import { JsonRpcRequest } from './jsonrpc';
import { Callback, LegacyProvider, NotificationCallback } from './legacy-provider';
import { LegacyProviderAdapter } from './legacy-provider-adapter';

interface WebsocketProviderOptions {
  timeout?: number;
  protocol?: string;
  clientOptions?: ClientOptions;
}

type CallbackEntry = {
  callback: Callback;
  method: string;
};

export class WebsocketProvider extends LegacyProviderAdapter {
  private legacyProvider: LegacyWebsocketProvider;

  constructor(url: string, options: WebsocketProviderOptions = {}) {
    const legacyProvider = new LegacyWebsocketProvider(url, options);
    super(legacyProvider);
    this.legacyProvider = legacyProvider;
  }

  public disconnect() {
    this.legacyProvider.disconnect();
  }
}

class LegacyWebsocketProvider implements LegacyProvider {
  private options: WebsocketProviderOptions;
  private responseCallbacks: { [key: string]: CallbackEntry } = {};
  private notificationCallbacks: NotificationCallback[] = [];
  private connection: Ws;
  private lastChunk: string = '';
  private lastChunkTimeout?: NodeJS.Timer;
  public connected: boolean = false;

  constructor(url: string, options: WebsocketProviderOptions = {}) {
    this.options = options;
    this.connection = new Ws(url, options.protocol, options.clientOptions);

    this.connection.onopen = this.onOpen;
    this.connection.onerror = this.onError;
    this.connection.onclose = this.onClose;
    this.connection.onmessage = this.onMessage;
  }

  private onOpen = () => {
    this.connected = true;
  };

  private onError = () => {
    this.timeout();
  };

  private onClose = () => {
    this.timeout();
    this.reset();
    this.connected = false;
  };

  private onMessage = (e: any) => {
    const data: string = typeof e.data === 'string' ? e.data : '';

    this.parseResponse(data).forEach(result => {
      let id = null;

      // get the id which matches the returned id
      if (isArray(result)) {
        result.forEach((load: any) => {
          if (this.responseCallbacks[load.id]) {
            id = load.id;
          }
        });
      } else {
        id = result.id;
      }

      // notification
      if (!id && result && result.method && result.method.indexOf('_subscription') !== -1) {
        this.notificationCallbacks.forEach(callback => {
          callback(result);
        });

        // fire the callback
      } else if (id && this.responseCallbacks[id]) {
        this.responseCallbacks[id].callback(undefined, result);
        delete this.responseCallbacks[id];
      }
    });
  };

  private parseResponse(data: string) {
    const returnValues: any[] = [];

    // DE-CHUNKER
    const dechunkedData = data
      .replace(/\}[\n\r]?\{/g, '}|--|{') // }{
      .replace(/\}\][\n\r]?\[\{/g, '}]|--|[{') // }][{
      .replace(/\}[\n\r]?\[\{/g, '}|--|[{') // }[{
      .replace(/\}\][\n\r]?\{/g, '}]|--|{') // }]{
      .split('|--|');

    dechunkedData.forEach(data => {
      // prepend the last chunk
      if (this.lastChunk) {
        data = this.lastChunk + data;
      }

      let result = null;

      try {
        result = JSON.parse(data);
      } catch (e) {
        this.lastChunk = data;

        // start timeout to cancel all requests
        clearTimeout(this.lastChunkTimeout!);
        this.lastChunkTimeout = setTimeout(() => {
          this.timeout();
          throw new Error(`Invalid response data: ${data}`);
        }, 1000 * 15);

        return;
      }

      // cancel timeout and set chunk to null
      clearTimeout(this.lastChunkTimeout!);
      this.lastChunk = '';

      if (result) {
        returnValues.push(result);
      }
    });

    return returnValues;
  }

  private addResponseCallback(payload: any, callback: Callback) {
    const id = payload.id || payload[0].id;
    const method = payload.method || payload[0].method;

    this.responseCallbacks[id] = { callback, method };

    // schedule triggering the error response if a custom timeout is set
    if (this.options.timeout) {
      setTimeout(() => {
        if (this.responseCallbacks[id]) {
          this.responseCallbacks[id].callback(new Error('Connection timeout'), undefined);
          delete this.responseCallbacks[id];
        }
      }, this.options.timeout);
    }
  }

  private timeout() {
    for (const key in this.responseCallbacks) {
      if (this.responseCallbacks[key]) {
        this.responseCallbacks[key].callback(new Error('Connection error'), undefined);
        delete this.responseCallbacks[key];
      }
    }
  }

  public send(payload: JsonRpcRequest, callback: Callback) {
    if (this.connection.readyState === this.connection.CONNECTING) {
      setTimeout(() => {
        this.send(payload, callback);
      }, 10);
      return;
    }

    if (this.connection.readyState !== this.connection.OPEN) {
      // tslint:disable-next-line:no-console
      console.error('connection not open on send()');
      this.onError();
      callback(new Error('connection not open'), undefined);
      return;
    }

    this.connection.send(JSON.stringify(payload));
    this.addResponseCallback(payload, callback);
  }

  public on(type: string, callback: NotificationCallback) {
    switch (type) {
      case 'data':
        this.notificationCallbacks.push(callback);
        break;
      default:
        throw new Error('Only supports data.');
    }
  }

  public removeListener(type: string, callback: NotificationCallback) {
    switch (type) {
      case 'data':
        const i = this.notificationCallbacks.indexOf(callback);
        if (i !== -1) {
          this.notificationCallbacks.splice(i, 1);
        }
        break;
      default:
        throw new Error('Only supports data.');
    }
  }

  public removeAllListeners(type: string) {
    switch (type) {
      case 'data':
        this.notificationCallbacks = [];
        break;
      default:
        throw new Error('Only supports data.');
    }
  }

  public reset() {
    this.timeout();
    this.notificationCallbacks = [];
  }

  public disconnect() {
    if (this.connection) {
      this.connection.close();
    }
  }
}
