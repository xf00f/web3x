import { toBufferBE } from 'bigint-buffer';
import { EventEmitter } from 'events';
import levelup, { LevelUp } from 'levelup';
import { Address } from '../../address';
import {
  BlockHeaderResponse,
  fromRawCallRequest,
  fromRawLogRequest,
  fromRawTransactionRequest,
  LogResponse,
  toRawBlockHeaderResponse,
  toRawLogResponse,
} from '../../formatters';
import { EthereumProvider, EthereumProviderNotifications } from '../../providers';
import { bufferToHex, numberToHex } from '../../utils';
import { Wallet } from '../../wallet';
import { Blockchain, BlockHeader } from '../blockchain';
import { getAccountCode } from '../vm';
import { getAccountTransactions } from '../vm/get-account-transactions';
import { WorldState } from '../world';
import { handleCall } from './handle-call';
import { getLogs } from './handle-get-logs';
import { handleGetTransactionByHash } from './handle-get-transaction';
import { handleGetTransactionReceipt } from './handle-get-transaction-receipt';
import { handleSendTransaction } from './handle-send-transaction';

export interface EvmProviderOptions {
  blockDelay?: number;
  wallet?: Wallet;
}

export class EvmProvider extends EventEmitter implements EthereumProvider {
  public wallet?: Wallet;
  private subscriptions: { [id: string]: any } = {};
  private nextSubscriptionId = 0;

  constructor(
    public readonly worldState: WorldState,
    private readonly blockchain: Blockchain,
    private options: EvmProviderOptions = {},
  ) {
    super();
    this.wallet = options.wallet;
  }

  public static fromEvmProvider(provider: EvmProvider, options?: EvmProviderOptions) {
    return new EvmProvider(provider.worldState, provider.blockchain, { wallet: provider.wallet, ...options });
  }

  public static async fromDb(db: LevelUp, options?: EvmProviderOptions) {
    const worldState = await WorldState.fromDb(db);
    const blockchain = await Blockchain.fromDb(db);
    return new EvmProvider(worldState, blockchain, options);
  }

  public static async fromLocalDb(name: string, options?: EvmProviderOptions) {
    const leveljs = require('level-js');
    return await EvmProvider.fromDb(levelup(leveljs(name)), options);
  }

  public static async eraseLocalDb(name: string) {
    return new Promise((resolve, reject) => {
      const req = indexedDB.deleteDatabase(`level-js-${name}`);
      req.onsuccess = resolve;
      req.onerror = reject;
      req.onblocked = reject;
    });
  }

  public async loadWallet(wallet: Wallet, amount: bigint = BigInt(10) * BigInt(10) ** BigInt(18)) {
    this.worldState.checkpoint();
    for (const address of wallet.currentAddresses()) {
      await this.worldState.createAccount(address, amount);
    }
    await this.worldState.commit();
    this.wallet = wallet;
  }

  public async send(method: string, params?: any[] | undefined): Promise<any> {
    // console.log(method);
    // console.log(params);

    switch (method) {
      case 'eth_accounts':
        return this.wallet ? this.wallet.currentAddresses() : [];
      case 'eth_gasPrice':
        return numberToHex(50000);
      case 'net_version':
        return numberToHex(666);
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
          this.options.blockDelay,
        );
      case 'eth_call':
        return bufferToHex(await handleCall(this.worldState, this.blockchain, fromRawCallRequest(params[0])));
      case 'eth_getTransactionCount':
        return numberToHex(await getAccountTransactions(this.worldState, Address.fromString(params![0])));
      case 'eth_getTransactionReceipt':
        return await handleGetTransactionReceipt(this.blockchain, params[0]);
      case 'eth_getTransactionByHash':
        return await handleGetTransactionByHash(this.blockchain, params[0]);
      case 'eth_getCode':
        return bufferToHex(await getAccountCode(this.worldState, Address.fromString(params![0])));
      case 'eth_getLogs':
        return (await getLogs(this.blockchain, fromRawLogRequest(params![0]))).map(toRawLogResponse);
      case 'eth_subscribe':
        return numberToHex(this.subscribe(params[0], params[1]));
      case 'eth_unsubscribe':
        return this.unsubscribe(params[0]);
      default:
        throw new Error(`Unsupported method ${method}`);
    }
  }

  private subscribe(event: string, params: any) {
    const id = numberToHex(this.nextSubscriptionId++);

    if (event === 'logs') {
      const listener = logs => this.handleLogs(id, logs);
      this.blockchain.on('logs', listener);
      this.subscriptions[id] = { event, params, listener };
    }

    if (event === 'newHeads') {
      const listener = (block, hash) => this.handleNewHead(id, block, hash);
      this.blockchain.on('newHeads', listener);
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

  private handleNewHead(subscription: string, block: BlockHeader, hash: Buffer) {
    const blockResponse: BlockHeaderResponse = {
      hash,
      ...block,
      difficulty: block.difficulty.toString(),
      gasLimit: Number(block.gasLimit),
      gasUsed: Number(block.gasUsed),
      nonce: toBufferBE(BigInt(block.nonce), 8),
    };
    this.emit('notification', { subscription, result: toRawBlockHeaderResponse(blockResponse) });
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
