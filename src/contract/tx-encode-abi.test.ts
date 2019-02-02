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
import { Eth } from '../eth/eth';
import { MockEthereumProvider } from '../providers/mock-ethereum-provider';
import { bufferToHex } from '../utils';
import { ContractAbi } from './abi/contract-abi';
import { Contract } from './contract';

const abi = new ContractAbi([
  {
    constant: true,
    inputs: [
      {
        name: 'a',
        type: 'bytes32',
      },
      {
        name: 'b',
        type: 'bytes32',
      },
    ],
    name: 'takesTwoBytes32',
    outputs: [
      {
        name: '',
        type: 'bytes32',
      },
    ],
    payable: false,
    type: 'function',
    stateMutability: 'view',
  },
]);

describe('eth', () => {
  describe('contract', () => {
    describe('encodeABI', () => {
      const contractAddress = Address.fromString('0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe');
      const mockEthereumProvider = new MockEthereumProvider();
      const eth = new Eth(mockEthereumProvider);

      it('should handle bytes32 arrays that only contain 1 byte', () => {
        const contract = new Contract(eth, abi, contractAddress);

        const result = contract.methods.takesTwoBytes32('0xaa', '0xbb').encodeABI();

        expect(bufferToHex(result)).toBe(
          [
            '0x1323517e',
            'aa00000000000000000000000000000000000000000000000000000000000000',
            'bb00000000000000000000000000000000000000000000000000000000000000',
          ].join(''),
        );
      });

      it('should handle bytes32 arrays that are short 1 byte', () => {
        const contract = new Contract(eth, abi, contractAddress);

        const result = contract.methods
          .takesTwoBytes32('0x'.concat('a'.repeat(62)), '0x'.concat('b'.repeat(62)))
          .encodeABI();

        expect(bufferToHex(result)).toBe(
          [
            '0x1323517e',
            'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa00',
            'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb00',
          ].join(''),
        );
      });

      it('should throw an exception on bytes32 arrays that have an invalid length', () => {
        const contract = new Contract(eth, abi, contractAddress);

        const test = () =>
          contract.methods.takesTwoBytes32('0x'.concat('a'.repeat(63)), '0x'.concat('b'.repeat(63))).encodeABI();

        expect(test).toThrow();
      });

      it('should handle bytes32 arrays that are full', () => {
        const contract = new Contract(eth, abi, contractAddress);

        const result = contract.methods
          .takesTwoBytes32('0x'.concat('a'.repeat(64)), '0x'.concat('b'.repeat(64)))
          .encodeABI();

        expect(bufferToHex(result)).toBe(
          [
            '0x1323517e',
            'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
          ].join(''),
        );
      });

      it('should throw an exception on bytes32 arrays that are too long', () => {
        const contract = new Contract(eth, abi, contractAddress);

        const test = () =>
          contract.methods.takesTwoBytes32('0x'.concat('a'.repeat(66)), '0x'.concat('b'.repeat(66))).encodeABI();

        expect(test).toThrow();
      });
    });
  });
});
