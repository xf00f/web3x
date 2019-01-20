import levelup, { LevelUp } from 'levelup';
import { Address } from '../address';
import { EthereumProvider, EthereumProviderNotifications } from '../providers';
import { bufferToHex, hexToBuffer, randomHex } from '../utils';
import { WorldState } from './world';

const leveljs = require('level-js');

export class EvmProvider implements EthereumProvider {
  private receipts: { [txHash: string]: any } = {};

  constructor(public readonly worldState: WorldState) {}

  public static async fromDb(db: LevelUp) {
    const worldState = await WorldState.fromDb(db);
    return new EvmProvider(worldState);
  }

  public static async fromLocalDb(name: string) {
    return await EvmProvider.fromDb(levelup(leveljs(name)));
  }

  public async send(method: string, params?: any[] | undefined): Promise<any> {
    // console.log(method);
    // console.log(params);

    if (method === 'eth_sendTransaction') {
      if (!params || !params[0]) {
        return;
      }
      const { from, to, data = '0x', value = '0x0' } = params[0];

      // TODO: Generate from tx.
      const txHash = randomHex(32);

      if (from && !to && data) {
        const contractAddress = await this.worldState.createContractAccount(
          Address.fromString(from),
          hexToBuffer(data),
          BigInt(value),
        );
        const txReceipt = {
          from,
          blockHash: '0x1',
          contractAddress,
        };

        this.receipts[txHash] = txReceipt;
      } else {
        await this.worldState.runTransaction(
          Address.fromString(from),
          Address.fromString(to),
          hexToBuffer(data),
          BigInt(value),
        );
        const txReceipt = {
          from,
          blockHash: '0x1',
        };

        this.receipts[txHash] = txReceipt;
      }
      return txHash;
    }

    if (method === 'eth_call') {
      if (!params || !params[0]) {
        return;
      }
      const { from, to, data } = params[0];

      return bufferToHex(
        await this.worldState.call(
          from ? Address.fromString(from) : Address.ZERO,
          Address.fromString(to),
          hexToBuffer(data),
        ),
      );
    }

    if (method === 'eth_getTransactionReceipt') {
      if (!params || !params[0]) {
        return;
      }
      return this.receipts[params[0]];
    }

    if (method === 'eth_getCode') {
      const code = await this.worldState.getAccountCode(Address.fromString(params![0]));
      const codeStr = '0x' + code.toString('hex');
      return codeStr;
    }
  }

  public on(notification: 'notification', listener: (result: any) => void): this;
  public on(notification: 'connect', listener: () => void): this;
  public on(notification: 'close', listener: (code: number, reason: string) => void): this;
  public on(notification: 'networkChanged', listener: (networkId: string) => void): this;
  public on(notification: 'accountsChanged', listener: (accounts: string[]) => void): this;
  public on(notification: any, listener: any): this {
    throw new Error('Method not implemented.');
  }

  public removeListener(notification: 'notification', listener: (result: any) => void): this;
  public removeListener(notification: 'connect', listener: () => void): this;
  public removeListener(notification: 'close', listener: (code: number, reason: string) => void): this;
  public removeListener(notification: 'networkChanged', listener: (networkId: string) => void): this;
  public removeListener(notification: 'accountsChanged', listener: (accounts: string[]) => void): this;
  public removeListener(notification: any, listener: any): this {
    throw new Error('Method not implemented.');
  }

  public removeAllListeners(notification: EthereumProviderNotifications): any {
    throw new Error('Method not implemented.');
  }
}
