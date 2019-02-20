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

export interface EstimateRequest {
  from?: Address;
  to?: Address;
  gas?: string | number;
  gasPrice?: string | number;
  value?: string | number;
  data?: Buffer;
}

export interface RawEstimateRequest {
  from?: string;
  to?: string;
  gas?: string;
  gasPrice?: string;
  value?: string;
  data?: string;
}

export function toRawEstimateRequest(tx: EstimateRequest): RawEstimateRequest {
  const { from, to, gas, gasPrice, value, data } = tx;
  return {
    from: from ? from.toString().toLowerCase() : undefined,
    to: to ? to.toString().toLowerCase() : undefined,
    data: data ? bufferToHex(data) : undefined,
    value: value ? numberToHex(value) : undefined,
    gas: gas ? numberToHex(gas) : undefined,
    gasPrice: gasPrice ? numberToHex(gasPrice) : undefined,
  };
}

export function fromRawEstimateRequest(tx: RawEstimateRequest): EstimateRequest {
  const { from, to, gas, gasPrice, value, data } = tx;
  return {
    from: from ? Address.fromString(from) : undefined,
    to: to ? Address.fromString(to) : undefined,
    data: data ? hexToBuffer(data) : undefined,
    value: value ? hexToNumberString(value) : undefined,
    gas: gas ? hexToNumberString(gas) : undefined,
    gasPrice: gasPrice ? hexToNumberString(gasPrice) : undefined,
  };
}
