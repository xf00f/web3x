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

interface SubscriptionOptions {
  symKeyID: string;
  privateKeyID: string;
  sig?: string;
  topics?: string[];
  minPow?: number;
  allowP2P?: boolean;
}

interface Post {
  symKeyID?: string;
  pubKey?: string;
  sig?: string;
  ttl: number;
  topic: string;
  payload: string;
  padding?: number;
  powTime?: number;
  powTarget?: number;
  targetPeer?: number;
}

const identity = result => result;

class ShhRequestPayloads {
  public getVersion() {
    return {
      method: 'shh_version',
      format: identity,
    };
  }

  public getInfo() {
    return {
      method: 'shh_info',
      format: identity,
    };
  }

  public setMaxMessageSize(size: number) {
    return {
      method: 'shh_setMaxMessageSize',
      params: [size],
      format: identity,
    };
  }

  public setMinPoW(pow: number) {
    return {
      method: 'shh_setMinPow',
      params: [pow],
      format: identity,
    };
  }

  public markTrustedPeer(enode: string) {
    return {
      method: 'shh_markTrustedPeer',
      params: [enode],
      format: identity,
    };
  }

  public newKeyPair() {
    return {
      method: 'shh_newKeyPair',
      format: identity,
    };
  }

  public addPrivateKey(privateKey: string) {
    return {
      method: 'shh_addPrivateKey',
      params: [privateKey],
      format: identity,
    };
  }

  public deleteKeyPair(id: string) {
    return {
      method: 'shh_deleteKeyPair',
      params: [id],
      format: identity,
    };
  }

  public hasKeyPair(id: string) {
    return {
      method: 'shh_hasKeyPair',
      params: [id],
      format: identity,
    };
  }

  public getPublicKey(id: string) {
    return {
      method: 'shh_getPublicKey',
      params: [id],
      format: identity,
    };
  }

  public getPrivateKey(id: string) {
    return {
      method: 'shh_getPrivateKey',
      params: [id],
      format: identity,
    };
  }

  public newSymKey() {
    return {
      method: 'shh_newSymKey',
      format: identity,
    };
  }

  public addSymKey(symKey: string) {
    return {
      method: 'shh_addSymKey',
      params: [symKey],
      format: identity,
    };
  }

  public generateSymKeyFromPassword(password: string) {
    return {
      method: 'shh_generateSymKeyFromPassword',
      params: [password],
      format: identity,
    };
  }

  public hasSymKey(id: string) {
    return {
      method: 'shh_hasSymKey',
      params: [id],
      format: identity,
    };
  }

  public getSymKey(id: string) {
    return {
      method: 'shh_getSymKey',
      params: [id],
      format: identity,
    };
  }

  public deleteSymKey(id: string) {
    return {
      method: 'shh_deleteSymKey',
      params: [id],
      format: identity,
    };
  }

  public newMessageFilter(options: SubscriptionOptions) {
    return {
      method: 'shh_newMessageFilter',
      params: [options],
      format: identity,
    };
  }

  public getFilterMessages(id: string) {
    return {
      method: 'shh_getFilterMessages',
      params: [id],
      format: identity,
    };
  }

  public deleteMessageFilter(id: string) {
    return {
      method: 'shh_deleteMessageFilter',
      params: [id],
      format: identity,
    };
  }

  public post(post: Post) {
    return {
      method: 'shh_post',
      params: [post],
      format: identity,
    };
  }

  public unsubscribe(id: string) {
    return {
      method: 'shh_unsubscribe',
      params: [id],
      format: identity,
    };
  }
}
