import { EventEmitter } from 'events';
import levelup, { LevelUp } from 'levelup';
import { Address } from '../../address';
import {
  fromRawCallRequest,
  fromRawLogRequest,
  fromRawTransactionRequest,
  LogResponse,
  toRawLogResponse,
  toRawTransactionReceipt,
} from '../../formatters';
import { EthereumProvider, EthereumProviderNotifications } from '../../providers';
import { bufferToHex, numberToHex } from '../../utils';
import { Wallet } from '../../wallet';
import { Blockchain } from '../blockchain';
import { getAccountCode } from '../vm';
import { WorldState } from '../world';
import { handleCall } from './handle-call';
import { getLogs } from './handle-get-logs';
import { handleGetTransactionReceipt } from './handle-get-transaction-receipt';
import { handleSendTransaction } from './handle-send-transaction';

export class EvmProvider extends EventEmitter implements EthereumProvider {
  public wallet?: Wallet;
  private subscriptions: { [id: string]: any } = {};
  private nextSubscriptionId = 0;

  constructor(public readonly worldState: WorldState, private readonly blockchain: Blockchain) {
    super();
  }

  public static fromEvmProvider(provider: EvmProvider) {
    return new EvmProvider(provider.worldState, provider.blockchain);
  }

  public static async fromDb(db: LevelUp) {
    const worldState = await WorldState.fromDb(db);
    const blockchain = await Blockchain.fromDb(db);
    return new EvmProvider(worldState, blockchain);
  }

  public static async fromLocalDb(name: string) {
    const leveljs = require('level-js');
    return await EvmProvider.fromDb(levelup(leveljs(name)));
  }

  public static async eraseLocalDb(name: string) {
    return new Promise((resolve, reject) => {
      const req = indexedDB.deleteDatabase(`level-js-${name}`);
      req.onsuccess = resolve;
      req.onerror = reject;
      req.onblocked = reject;
    });
  }

  public async send(method: string, params?: any[] | undefined): Promise<any> {
    // console.log(method);
    // console.log(params);

    switch (method) {
      case 'eth_gasPrice':
        return numberToHex(50000);
    }

    if (!params || !params[0]) {
      throw new Error();
    }

    switch (method) {
      case 'eth_sendTransaction':
        if (!this.wallet) {
          throw new Error('No wallet available for signing transactions.');
        }
        return await handleSendTransaction(
          this.worldState,
          this.blockchain,
          fromRawTransactionRequest(params[0]),
          this.wallet,
        );
      case 'eth_call':
        return bufferToHex(await handleCall(this.worldState, fromRawCallRequest(params[0])));
      case 'eth_getTransactionReceipt':
        return toRawTransactionReceipt(await handleGetTransactionReceipt(this.blockchain, params[0]));
      case 'eth_getCode':
        return bufferToHex(await getAccountCode(this.worldState, Address.fromString(params![0])));
      case 'eth_getLogs':
        return (await getLogs(this.blockchain, fromRawLogRequest(params![0]))).map(toRawLogResponse);
      case 'eth_subscribe':
        return numberToHex(this.subscribe(params[0], params[1]));
      case 'eth_unsubscribe':
        return this.unsubscribe(params[0]);
    }
  }

  private subscribe(event: string, params: any) {
    const id = numberToHex(this.nextSubscriptionId++);

    if (event === 'logs') {
      const listener = logs => this.handleLogs(id, logs);
      this.blockchain.on('logs', listener);
      this.subscriptions[id] = { event, params, listener };
    }

    return id;
  }

  private unsubscribe(id: string) {
    const sub = this.subscriptions[id];
    if (!sub) {
      return false;
    }
    delete this.subscriptions[id];
    this.blockchain.removeListener(sub.event, sub.listener);
    return true;
  }

  private handleLogs(subscription: string, logResponse: LogResponse) {
    this.emit('notification', { subscription, result: toRawLogResponse(logResponse) });
  }

  public on(notification: 'notification', listener: (result: any) => void): this;
  public on(notification: 'connect', listener: () => void): this;
  public on(notification: 'close', listener: (code: number, reason: string) => void): this;
  public on(notification: 'networkChanged', listener: (networkId: string) => void): this;
  public on(notification: 'accountsChanged', listener: (accounts: string[]) => void): this;
  public on(notification: any, listener: any): this {
    return super.on(notification, listener);
  }

  public removeListener(notification: 'notification', listener: (result: any) => void): this;
  public removeListener(notification: 'connect', listener: () => void): this;
  public removeListener(notification: 'close', listener: (code: number, reason: string) => void): this;
  public removeListener(notification: 'networkChanged', listener: (networkId: string) => void): this;
  public removeListener(notification: 'accountsChanged', listener: (accounts: string[]) => void): this;
  public removeListener(notification: any, listener: any): this {
    return super.removeListener(notification, listener);
  }

  public removeAllListeners(notification: EthereumProviderNotifications): any {
    return super.removeAllListeners(notification);
  }
}
