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

import { isArray, isFunction } from 'util';
import { LegacyProvider } from './legacy-provider';
import { LegacyProviderAdapter } from './legacy-provider-adapter';

export class IpcProvider extends LegacyProviderAdapter {
  constructor(path: string, net: any) {
    super(new LegacyIpcProvider(path, net));
  }
}

class LegacyIpcProvider implements LegacyProvider {
  private responseCallbacks: any;
  private notificationCallbacks: any;
  public connected: boolean;
  private connection: any;
  private lastChunk: any;
  private lastChunkTimeout: any;

  constructor(private path: string, net: any) {
    this.responseCallbacks = {};
    this.notificationCallbacks = [];
    this.path = path;
    this.connected = false;

    this.connection = net.connect({ path: this.path });

    this.addDefaultEvents();

    // LISTEN FOR CONNECTION RESPONSES
    const callback = function(result) {
      let id: any = null;

      // get the id which matches the returned id
      if (isArray(result)) {
        result.forEach(load => {
          if (this.responseCallbacks[load.id]) {
            id = load.id;
          }
        });
      } else {
        id = result.id;
      }

      // notification
      if (!id && result.method.indexOf('_subscription') !== -1) {
        this.notificationCallbacks.forEach(callback => {
          if (isFunction(callback)) {
            callback(result);
          }
        });

        // fire the callback
      } else if (this.responseCallbacks[id]) {
        this.responseCallbacks[id](null, result);
        delete this.responseCallbacks[id];
      }
    };

    this.connection.on('data', data => {
      this._parseResponse(data.toString()).forEach(callback);
    });
  }

  public addDefaultEvents() {
    this.connection.on('connect', () => {
      this.connected = true;
    });

    this.connection.on('close', () => {
      this.connected = false;
    });

    this.connection.on('error', () => {
      this._timeout();
    });

    this.connection.on('end', () => {
      this._timeout();
    });

    this.connection.on('timeout', () => {
      this._timeout();
    });
  }

  private _parseResponse(data) {
    const returnValues = [];

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
        clearTimeout(this.lastChunkTimeout);
        this.lastChunkTimeout = setTimeout(() => {
          this._timeout();
          throw new Error('Timeout');
        }, 1000 * 15);

        return;
      }

      // cancel timeout and set chunk to null
      clearTimeout(this.lastChunkTimeout);
      this.lastChunk = null;

      if (result) {
        returnValues.push(result);
      }
    });

    return returnValues;
  }

  private _addResponseCallback(payload, callback) {
    const id = payload.id || payload[0].id;
    const method = payload.method || payload[0].method;

    this.responseCallbacks[id] = callback;
    this.responseCallbacks[id].method = method;
  }

  private _timeout() {
    for (const key in this.responseCallbacks) {
      if (this.responseCallbacks.hasOwnProperty(key)) {
        this.responseCallbacks[key](new Error(`CONNECTION ERROR: Couldn't connect to node on IPC.`));
        delete this.responseCallbacks[key];
      }
    }
  }

  public reconnect() {
    this.connection.connect({ path: this.path });
  }

  public send(payload, callback) {
    // try reconnect, when connection is gone
    if (!this.connection.writable) {
      this.connection.connect({ path: this.path });
    }

    this.connection.write(JSON.stringify(payload));
    this._addResponseCallback(payload, callback);
  }

  public on(type, callback) {
    if (typeof callback !== 'function') {
      throw new Error('The second parameter callback must be a function.');
    }

    switch (type) {
      case 'data':
        this.notificationCallbacks.push(callback);
        break;

      // adds error, end, timeout, connect
      default:
        this.connection.on(type, callback);
        break;
    }
  }

  public once(type, callback) {
    if (typeof callback !== 'function') {
      throw new Error('The second parameter callback must be a function.');
    }

    this.connection.once(type, callback);
  }

  public removeListener(type, callback) {
    switch (type) {
      case 'data':
        this.notificationCallbacks.forEach((cb, index) => {
          if (cb === callback) {
            this.notificationCallbacks.splice(index, 1);
          }
        });
        break;

      default:
        this.connection.removeListener(type, callback);
        break;
    }
  }

  public removeAllListeners(type) {
    switch (type) {
      case 'data':
        this.notificationCallbacks = [];
        break;

      default:
        this.connection.removeAllListeners(type);
        break;
    }
  }

  public reset() {
    this._timeout();
    this.notificationCallbacks = [];

    this.connection.removeAllListeners('error');
    this.connection.removeAllListeners('end');
    this.connection.removeAllListeners('timeout');

    this.addDefaultEvents();
  }

  public disconnect() {
    this.connection.close();
  }
}
