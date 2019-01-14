import { Eth } from '..';
import { GetLogOptions, inputLogFormatter, Log, outputLogFormatter } from '../../formatters';
import { Subscription } from '../../subscriptions';

export function subscribeForLogs(eth: Eth, options: GetLogOptions = {}): Subscription<Log> {
  const { fromBlock, ...subLogOptions } = options;
  const params = [inputLogFormatter(subLogOptions)];

  const subscription = new Subscription<Log>(
    'eth',
    'logs',
    params,
    eth.provider,
    (result, sub) => {
      const output = outputLogFormatter(result);
      sub.emit(output.removed ? 'changed' : 'data', output, sub);
    },
    false,
  );

  if (fromBlock !== undefined) {
    eth
      .getPastLogs(options)
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
