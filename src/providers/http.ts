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

import { Provider } from '.';
import { errors } from '../core-helpers';
import XMLHttpRequest from 'node-http-xhr';
//import http, { Agent as HttpAgent } from 'http';
//import https, { Agent as HttpsAgent } from 'https';

/**
 * HttpProvider should be used to send rpc calls over http
 */
export class HttpProvider implements Provider {
  //private httpAgent?: HttpAgent;
  //private httpsAgent?: HttpsAgent;
  private timeout: number;
  private headers: any;
  private connected: boolean;

  constructor(private host: string, options?: any) {
    options = options || {};
    this.host = host || 'http://localhost:8545';
    /*
    if (this.host.substring(0, 5) === 'https') {
      this.httpsAgent = new https.Agent({ keepAlive: true });
    } else {
      this.httpAgent = new http.Agent({ keepAlive: true });
    }
    */
    this.timeout = options.timeout || 0;
    this.headers = options.headers;
    this.connected = false;
  }

  private _prepareRequest() {
    var request = new XMLHttpRequest();
    /*
    request.nodejsSet({
      httpsAgent: this.httpsAgent,
      httpAgent: this.httpAgent,
    });
    */

    request.open('POST', this.host, true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.timeout = this.timeout && this.timeout !== 1 ? this.timeout : 0;
    request.withCredentials = true;

    if (this.headers) {
      this.headers.forEach(function(header) {
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
  send(payload, callback) {
    var _this = this;
    var request = this._prepareRequest();

    request.onreadystatechange = function() {
      if (request.readyState === 4 && request.timeout !== 1) {
        var result = request.responseText;
        var error: any = null;

        try {
          result = JSON.parse(result);
        } catch (e) {
          error = errors.InvalidResponse(request.responseText);
        }

        _this.connected = true;
        callback(error, result);
      }
    };

    request.ontimeout = function() {
      _this.connected = false;
      callback(errors.ConnectionTimeout(this.timeout));
    };

    try {
      request.send(JSON.stringify(payload));
    } catch (error) {
      this.connected = false;
      callback(errors.InvalidConnection(this.host));
    }
  }

  disconnect() {
    /*
    if (this.httpAgent) {
      this.httpAgent.destroy();
    }
    if (this.httpsAgent) {
      this.httpsAgent.destroy();
    }
    */
  }
}
