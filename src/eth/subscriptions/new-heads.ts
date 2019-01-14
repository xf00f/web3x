import { BlockHeader } from '..';
import { outputBlockFormatter } from '../../formatters';
import { EthereumProvider } from '../../providers';
import { Subscription } from '../../subscriptions';

export function subscribeForNewHeads(provider: EthereumProvider): Subscription<BlockHeader> {
  return new Subscription<BlockHeader>('eth', 'newHeads', [], provider, (result, sub) => {
    const output = outputBlockFormatter(result);
    sub.emit('data', output, sub);
  });
}
