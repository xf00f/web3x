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

import { AbiDefinition } from '..';
import { Address } from '../../types';

export interface FixtureDefinition {
  methods: {
    addStruct(nestedStruct: { status: boolean }): void;
    listOfNestedStructs(address: string): { status: boolean };
    balance(who: Address): number;
    hasALotOfParams(_var1: string, _var2: string, _var3: string[]): string;
    getStr(): string;
    owner(): Address;
    mySend(to: Address, value: number): void;
    myDisallowedSend(to: Address, value: number): void;
    testArr(value: number[]): number;
    overloadedFunction(a?: number): number;
  };
  events: {
    Changed: {
      from: Address;
      amount: string;
      t1: string;
      t2: string;
    }[];
  };
}

export const abi: AbiDefinition[] = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'who',
        type: 'address',
      },
      {
        name: 'myValue',
        type: 'uint256',
      },
    ],
  },
  {
    constant: false,
    inputs: [
      {
        components: [{ name: 'status', type: 'bool' }],
        name: 'nestedStruct',
        type: 'tuple',
      },
    ],
    name: 'addStruct',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    name: 'listOfNestedStructs',
    outputs: [
      {
        components: [{ name: 'status', type: 'bool' }],
        name: 'nestedStruct',
        type: 'tuple',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'balance',
    type: 'function',
    inputs: [
      {
        name: 'who',
        type: 'address',
      },
    ],
    constant: true,
    outputs: [
      {
        name: 'value',
        type: 'uint256',
      },
    ],
  },
  {
    name: 'hasALotOfParams',
    inputs: [
      {
        name: '_var1',
        type: 'bytes32',
      },
      {
        name: '_var2',
        type: 'string',
      },
      {
        name: '_var3',
        type: 'bytes32[]',
      },
    ],
    outputs: [
      {
        name: 'owner',
        type: 'address',
      },
    ],
    constant: false,
    payable: false,
    type: 'function',
  },
  {
    name: 'getStr',
    type: 'function',
    inputs: [],
    constant: true,
    outputs: [
      {
        name: 'myString',
        type: 'string',
      },
    ],
  },
  {
    name: 'owner',
    type: 'function',
    inputs: [],
    constant: true,
    outputs: [
      {
        name: 'owner',
        type: 'address',
      },
    ],
  },
  {
    name: 'mySend',
    type: 'function',
    inputs: [
      {
        name: 'to',
        type: 'address',
      },
      {
        name: 'value',
        type: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    name: 'myDisallowedSend',
    type: 'function',
    inputs: [
      {
        name: 'to',
        type: 'address',
      },
      {
        name: 'value',
        type: 'uint256',
      },
    ],
    outputs: [],
    payable: false,
  },
  {
    name: 'testArr',
    type: 'function',
    inputs: [
      {
        name: 'value',
        type: 'int[]',
      },
    ],
    constant: true,
    outputs: [
      {
        name: 'd',
        type: 'int',
      },
    ],
  },
  {
    name: 'Changed',
    type: 'event',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: true },
      { name: 't1', type: 'uint256', indexed: false },
      { name: 't2', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'Unchanged',
    type: 'event',
    inputs: [
      { name: 'value', type: 'uint256', indexed: true },
      { name: 'addressFrom', type: 'address', indexed: true },
      { name: 't1', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'overloadedFunction',
    type: 'function',
    inputs: [{ name: 'a', type: 'uint256' }],
    constant: true,
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
  },
  {
    name: 'overloadedFunction',
    type: 'function',
    inputs: [],
    constant: true,
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
  },
];
