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
import { TransactionRequest } from '../formatters';
import { EthereumProvider } from '../providers/ethereum-provider';
import { Data, Quantity, TransactionHash } from '../types';
import { PersonalRequestPayloads } from './personal-request-payloads';

export interface Transaction extends TransactionRequest {
  condition?: { block: number } | { time: number } | null;
}

export interface SignedTransaction {
  raw: Data;
  tx: Transaction;
}

export class Personal {
  public readonly request = new PersonalRequestPayloads();

  constructor(private provider: EthereumProvider) {}

  private async send({ method, params, format }: { method: string; params?: any[]; format: any }) {
    return format(await this.provider.send(method, params));
  }

  public async getAccounts(): Promise<Address[]> {
    const payload = this.request.getAccounts();
    return payload.format(await this.send(payload));
  }

  public async newAccount(password: string): Promise<Address> {
    const payload = this.request.newAccount(password);
    return payload.format(await this.send(payload));
  }

  public async unlockAccount(address: Address, password: string, duration: Quantity): Promise<boolean> {
    const payload = this.request.unlockAccount(address, password, duration);
    return payload.format(await this.send(payload));
  }

  public async lockAccount(address: Address) {
    const payload = this.request.lockAccount(address);
    return payload.format(await this.send(payload));
  }

  public async importRawKey(privateKey: Data, password: string): Promise<Address> {
    const payload = this.request.importRawKey(privateKey, password);
    return payload.format(await this.send(payload));
  }

  public async sendTransaction(tx: Transaction, password: string): Promise<TransactionHash> {
    const payload = this.request.sendTransaction(tx, password);
    return payload.format(await this.send(payload));
  }

  public async signTransaction(tx: Transaction, password: string): Promise<SignedTransaction> {
    const payload = this.request.signTransaction(tx, password);
    return payload.format(await this.send(payload));
  }

  public async sign(data: Data, address: Address, password: string): Promise<Data> {
    const payload = this.request.sign(data, address, password);
    return payload.format(await this.send(payload));
  }

  public async ecRecover(data: Data, signedData: Data): Promise<Address> {
    const payload = this.request.ecRecover(data, signedData);
    return payload.format(await this.send(payload));
  }
}
