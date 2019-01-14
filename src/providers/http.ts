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

import XMLHttpRequest from 'node-http-xhr';
import { LegacyProvider } from './legacy-provider';
import { LegacyProviderAdapter } from './legacy-provider-adapter';

export class HttpProvider extends LegacyProviderAdapter {
  constructor(host: string, options?: any) {
    super(new LegacyHttpProvider(host, options));
  }
}

/**
 * HttpProvider should be used to send rpc calls over http
 */
class LegacyHttpProvider implements LegacyProvider {
  private timeout: number;
  private headers: any;
  private connected: boolean;

  constructor(private host: string, options?: any) {
    options = options || {};
    this.host = host || 'http://localhost:8545';
    this.timeout = options.timeout || 0;
    this.headers = options.headers;
    this.connected = false;
  }

  private _prepareRequest() {
    const request = new XMLHttpRequest();

    request.open('POST', this.host, true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.timeout = this.timeout && this.timeout !== 1 ? this.timeout : 0;
    request.withCredentials = true;

    if (this.headers) {
      this.headers.forEach(header => {
        request.setRequestHeader(header.name, header.value);
      });
    }

    return request;
  }

  /**
   * Should be used to make async request
   *
   * @method send
   * @param {Object} payload
   * @param {Function} callback triggered on end with (err, result)
   */
  public send(payload, callback) {
    const request = this._prepareRequest();

    request.onreadystatechange = () => {
      if (request.readyState === 4 && request.timeout !== 1) {
        let result = request.responseText;
        let error: any = null;

        try {
          result = JSON.parse(result);
        } catch (e) {
          error = new Error(`Invalid response: ${request.responseText}`);
        }

        this.connected = true;
        callback(error, result);
      }
    };

    request.ontimeout = () => {
      this.connected = false;
      callback(new Error(`CONNECTION TIMEOUT: Timeout of ${this.timeout} ms.`));
    };

    try {
      request.send(JSON.stringify(payload));
    } catch (error) {
      this.connected = false;
      callback(new Error(`CONNECTION ERROR: Couldn't connect to node ${this.host}.`));
    }
  }

  public disconnect() {}
}
