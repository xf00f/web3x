/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import { fromWei } from 'web3x/utils';
import { Eth } from 'web3x/eth';
import { Address } from 'web3x/address';

export async function getBalance(eth: Eth, address: Address) {
  const balance = await eth.getBalance(address);
  return fromWei(balance, 'ether');
}
