import { isBoolean } from 'util';
import { outputSyncingFormatter } from '../../formatters';
import { EthereumProvider } from '../../providers';
import { Subscription } from '../../subscriptions';

export function subscribeForSyncing(provider: EthereumProvider): Subscription<object | boolean> {
  return new Subscription<object | boolean>('eth', 'newHeads', [], provider, (result, sub) => {
    const output = outputSyncingFormatter(result);
    sub.emit(isBoolean(output) ? 'changed' : 'data', output);
  });
}
