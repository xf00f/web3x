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
import { bufferToHex, hexToBuffer, hexToNumberString, numberToHex } from '../utils';

export interface PartialTransactionRequest {
  from?: Address;
  to?: Address;
  gas?: string | number;
  gasPrice?: string | number;
  value?: string | number;
  data?: Buffer;
  nonce?: string | number;
}

export interface TransactionRequest {
  from: Address;
  to?: Address;
  gas?: string | number;
  gasPrice?: string | number;
  value?: string | number;
  data?: Buffer;
  nonce?: string | number;
}

export interface RawTransactionRequest {
  from: string;
  to?: string;
  gas?: string;
  gasPrice?: string;
  value?: string;
  data?: string;
  nonce?: string;
}

export function toRawTransactionRequest(tx: TransactionRequest): RawTransactionRequest {
  const { from, to, gas, gasPrice, value, nonce, data } = tx;
  return {
    from: from.toString().toLowerCase(),
    to: to ? to.toString().toLowerCase() : undefined,
    gas: gas ? numberToHex(gas) : undefined,
    gasPrice: gasPrice ? numberToHex(gasPrice) : undefined,
    value: value ? numberToHex(value) : undefined,
    data: data ? bufferToHex(data) : undefined,
    nonce: nonce ? numberToHex(nonce) : undefined,
  };
}

export function fromRawTransactionRequest(tx: RawTransactionRequest): TransactionRequest {
  const { from, to, gas, gasPrice, value, nonce, data } = tx;
  return {
    from: Address.fromString(from),
    to: to ? Address.fromString(to) : undefined,
    gas: gas ? hexToNumberString(gas) : undefined,
    gasPrice: gasPrice ? hexToNumberString(gasPrice) : undefined,
    value: value ? hexToNumberString(value) : undefined,
    data: data ? hexToBuffer(data) : undefined,
    nonce: nonce ? hexToNumberString(nonce) : undefined,
  };
}
