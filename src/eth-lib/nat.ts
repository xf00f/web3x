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

import BN from 'bn.js';
import Bytes from './bytes';

const fromBN = bn => '0x' + bn.toString('hex');

const toBN = str => new BN(str.slice(2), 16);

const fromString = str => {
  const bn = '0x' + (str.slice(0, 2) === '0x' ? new BN(str.slice(2), 16) : new BN(str, 10)).toString('hex');
  return bn === '0x0' ? '0x' : bn;
};

const toEther = wei => toNumber(div(wei, fromString('10000000000'))) / 100000000;

const fromEther = eth => mul(fromNumber(Math.floor(eth * 100000000)), fromString('10000000000'));

const toString = a => toBN(a).toString(10);

const fromNumber = a => (typeof a === 'string' ? (/^0x/.test(a) ? a : '0x' + a) : '0x' + new BN(a).toString('hex'));

const toNumber = a => toBN(a).toNumber();

const toUint256 = a => Bytes.pad(32, a);

const bin = method => (a, b) => fromBN(toBN(a)[method](toBN(b)));

const add = bin('add');
const mul = bin('mul');
const div = bin('div');
const sub = bin('sub');

export default { toString, fromString, toNumber, fromNumber, toEther, fromEther, toUint256, add, mul, div, sub };
