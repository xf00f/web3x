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

import { Eth } from '..';
import { fromRawLogResponse, LogRequest, LogResponse, RawLogResponse, toRawLogRequest } from '../../formatters';
import { Subscription } from '../../subscriptions';

export function subscribeForLogs(eth: Eth, logRequest: LogRequest = {}) {
  const { fromBlock, ...subscriptionLogRequest } = logRequest;
  const params = [toRawLogRequest(subscriptionLogRequest)];

  const subscription = new Subscription<LogResponse, RawLogResponse>(
    'eth',
    'logs',
    params,
    eth.provider,
    (result, sub) => {
      const output = fromRawLogResponse(result);
      sub.emit(output.removed ? 'changed' : 'data', output, sub);
    },
    false,
  );

  if (fromBlock !== undefined) {
    eth
      .getPastLogs(logRequest)
      .then(logs => {
        logs.forEach(log => subscription.emit('data', log, subscription));
        subscription.subscribe();
      })
      .catch(err => {
        subscription.emit('error', err, subscription);
      });
  } else {
    subscription.subscribe();
  }

  return subscription;
}
