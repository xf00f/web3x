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

import http from 'http';
import https from 'https';
import fetch from 'isomorphic-fetch';
import { LegacyProvider } from './legacy-provider';
import { LegacyProviderAdapter } from './legacy-provider-adapter';

export class HttpProvider extends LegacyProviderAdapter {
  constructor(host: string, options: any = {}) {
    super(new LegacyHttpProvider(host, options));
  }
}

class LegacyHttpProvider implements LegacyProvider {
  constructor(private host: string, private options: any = {}) {
    this.host = host || 'http://localhost:8545';

    if (options.keepAlive) {
      this.options.agent = /^https/.test(this.host)
        ? new https.Agent({ keepAlive: true })
        : new http.Agent({ keepAlive: true });
    }
  }

  public send(payload, callback) {
    fetch(this.host, {
      ...this.options,
      method: 'POST',
      credentials: 'include',
      headers: {
        ...this.options.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(response => response.json())
      .then(json => callback(undefined, json))
      .catch(callback);
  }

  public disconnect() {}
}
