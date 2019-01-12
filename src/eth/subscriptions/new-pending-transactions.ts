import { BlockHeader } from '..';
import { Transaction } from '../../formatters';
import { EthereumProvider } from '../../providers';
import { Subscription } from '../../subscriptions';

export function subscribeForNewPendingTransactions(provider: EthereumProvider): Subscription<Transaction> {
  return new Subscription<Transaction>('eth', 'newPendingTransactions', [], provider, (result, sub) => {
    sub.emit('data', result);
  });
}
