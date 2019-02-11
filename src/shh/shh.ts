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

import { EthereumProvider } from '../providers/ethereum-provider';
import { Subscription } from '../subscriptions';

export class Shh {
  public readonly request = new ShhRequestPayloads();

  constructor(private provider: EthereumProvider) {}

  private async send({ method, params, format }: { method: string; params?: any[]; format: any }) {
    return format(await this.provider.send(method, params));
  }

  public async getVersion() {
    const payload = this.request.getVersion();
    return payload.format(await this.send(payload));
  }

  public async getInfo() {
    const payload = this.request.getInfo();
    return payload.format(await this.send(payload));
  }

  public async setMaxMessageSize(size: number) {
    const payload = this.request.setMaxMessageSize(size);
    return payload.format(await this.send(payload));
  }

  public async setMinPoW(pow: number) {
    const payload = this.request.setMinPoW(pow);
    return payload.format(await this.send(payload));
  }

  public async markTrustedPeer(enode: string) {
    const payload = this.request.markTrustedPeer(enode);
    return payload.format(await this.send(payload));
  }

  public async newKeyPair() {
    const payload = this.request.newKeyPair();
    return payload.format(await this.send(payload));
  }

  public async addPrivateKey(privateKey: string) {
    const payload = this.request.addPrivateKey(privateKey);
    return payload.format(await this.send(payload));
  }

  public async deleteKeyPair(id: string) {
    const payload = this.request.deleteKeyPair(id);
    return payload.format(await this.send(payload));
  }

  public async hasKeyPair(id: string) {
    const payload = this.request.hasKeyPair(id);
    return payload.format(await this.send(payload));
  }

  public async getPublicKey(id: string) {
    const payload = this.request.getPublicKey(id);
    return payload.format(await this.send(payload));
  }

  public async getPrivateKey(id: string) {
    const payload = this.request.getPrivateKey(id);
    return payload.format(await this.send(payload));
  }

  public async newSymKey() {
    const payload = this.request.newSymKey();
    return payload.format(await this.send(payload));
  }

  public async addSymKey(symKey: string) {
    const payload = this.request.addSymKey(symKey);
    return payload.format(await this.send(payload));
  }

  public async generateSymKeyFromPassword(password: string) {
    const payload = this.request.generateSymKeyFromPassword(password);
    return payload.format(await this.send(payload));
  }

  public async hasSymKey(id: string) {
    const payload = this.request.hasSymKey(id);
    return payload.format(await this.send(payload));
  }

  public async getSymKey(id: string) {
    const payload = this.request.getSymKey(id);
    return payload.format(await this.send(payload));
  }

  public async deleteSymKey(id: string) {
    const payload = this.request.deleteSymKey(id);
    return payload.format(await this.send(payload));
  }

  public async newMessageFilter(options: SubscriptionOptions) {
    const payload = this.request.newMessageFilter(options);
    return payload.format(await this.send(payload));
  }

  public async getFilterMessages(id: string) {
    const payload = this.request.getFilterMessages(id);
    return payload.format(await this.send(payload));
  }

  public async deleteMessageFilter(id: string) {
    const payload = this.request.deleteMessageFilter(id);
    return payload.format(await this.send(payload));
  }

  public async post(post: Post) {
    const payload = this.request.post(post);
    return payload.format(await this.send(payload));
  }

  public subscribeMessages(options: SubscriptionOptions): Subscription<string> {
    return new Subscription<string>('shh', 'messages', [options], this.provider, (message, sub) =>
      sub.emit('data', message),
    );
  }

  public subscribe(type: 'messages', options: SubscriptionOptions): Subscription<any> {
    switch (type) {
      case 'messages':
        return this.subscribeMessages(options);
      default:
        throw new Error(`Unknown subscription type: ${type}`);
    }
  }
}
