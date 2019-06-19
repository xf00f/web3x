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

import { Address } from '../address';
import { EthereumProvider } from '../providers/ethereum-provider';
import { PersonalRequestPayloads, Transaction } from './personal-request-payloads';

export class Personal {
  public readonly request = new PersonalRequestPayloads();

  constructor(private provider: EthereumProvider) {}

  private async send<T>({ method, params, format }: { method: string; params?: any[]; format: (x: any) => T }) {
    return format(await this.provider.send(method, params));
  }

  public async getAccounts() {
    const payload = this.request.getAccounts();
    return await this.send(payload);
  }

  public async newAccount(password: string) {
    const payload = this.request.newAccount(password);
    return await this.send(payload);
  }

  public async unlockAccount(address: Address, password: string, duration: number) {
    const payload = this.request.unlockAccount(address, password, duration);
    return await this.send(payload);
  }

  public async lockAccount(address: Address) {
    const payload = this.request.lockAccount(address);
    return await this.send(payload);
  }

  public async importRawKey(privateKey: Buffer, password: string) {
    const payload = this.request.importRawKey(privateKey, password);
    return await this.send(payload);
  }

  public async sendTransaction(tx: Transaction, password: string) {
    const payload = this.request.sendTransaction(tx, password);
    return await this.send(payload);
  }

  public async signTransaction(tx: Transaction, password: string) {
    const payload = this.request.signTransaction(tx, password);
    return await this.send(payload);
  }

  public async sign(message: string, address: Address, password: string) {
    const payload = this.request.sign(message, address, password);
    return await this.send(payload);
  }

  public async ecRecover(message: string, signedData: string) {
    const payload = this.request.ecRecover(message, signedData);
    return await this.send(payload);
  }
}
