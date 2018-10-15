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

import * as Jsonrpc from './jsonrpc';
import { errors } from '../core-helpers';
import { IRequestManager } from '.';

export class BatchManager {
  requests: any[] = [];
  constructor(private requestManager: IRequestManager) {}

  /**
   * Should be called to add create new request to batch request
   *
   * @method add
   * @param {Object} jsonrpc requet object
   */
  add(request) {
    this.requests.push(request);
  }

  /**
   * Should be called to execute batch request
   *
   * @method execute
   */
  execute() {
    var requests = this.requests;
    this.requestManager.sendBatch(requests, function(err, results) {
      results = results || [];
      requests
        .map(function(request, index) {
          return results[index] || {};
        })
        .forEach(function(result, index) {
          if (requests[index].callback) {
            if (result && result.error) {
              return requests[index].callback(errors.ErrorResponse(result));
            }

            if (!Jsonrpc.isValidResponse(result)) {
              return requests[index].callback(errors.InvalidResponse(result));
            }

            try {
              requests[index].callback(
                null,
                requests[index].format ? requests[index].format(result.result) : result.result,
              );
            } catch (err) {
              requests[index].callback(err);
            }
          }
        });
    });
  }
}
