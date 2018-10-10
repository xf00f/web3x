import { RequestManager } from '../../core-request-manager';
import { Contract, AbiDefinition } from '.';

const abi: AbiDefinition[] = [
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
];

describe('eth', function() {
  describe('contract', function() {
    describe('encodeABI', function() {
      const contractAddress = '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe';
      let requestManager: RequestManager;

      it('should handle bytes32 arrays that only contain 1 byte', function() {
        const contract = new Contract(requestManager, abi, contractAddress);

        const result = contract.methods
          .takesTwoBytes32('0x'.concat('a'.repeat(2)), '0x'.concat('b'.repeat(2)))
          .encodeABI();

        expect(result).toBe(
          [
            '0x1323517e',
            'aa00000000000000000000000000000000000000000000000000000000000000',
            'bb00000000000000000000000000000000000000000000000000000000000000',
          ].join(''),
        );
      });

      it('should handle bytes32 arrays that are short 1 byte', function() {
        const contract = new Contract(requestManager, abi, contractAddress);

        const result = contract.methods
          .takesTwoBytes32('0x'.concat('a'.repeat(62)), '0x'.concat('b'.repeat(62)))
          .encodeABI();

        expect(result).toBe(
          [
            '0x1323517e',
            'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa00',
            'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb00',
          ].join(''),
        );
      });

      it('should throw an exception on bytes32 arrays that have an invalid length', function() {
        const contract = new Contract(requestManager, abi, contractAddress);

        const test = () =>
          contract.methods.takesTwoBytes32('0x'.concat('a'.repeat(63)), '0x'.concat('b'.repeat(63))).encodeABI();

        expect(test).toThrow();
      });

      it('should handle bytes32 arrays that are full', function() {
        const contract = new Contract(requestManager, abi, contractAddress);

        const result = contract.methods
          .takesTwoBytes32('0x'.concat('a'.repeat(64)), '0x'.concat('b'.repeat(64)))
          .encodeABI();

        expect(result).toBe(
          [
            '0x1323517e',
            'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
          ].join(''),
        );
      });

      it('should throw an exception on bytes32 arrays that are too long', function() {
        const contract = new Contract(requestManager, abi, contractAddress);

        const test = () =>
          contract.methods.takesTwoBytes32('0x'.concat('a'.repeat(66)), '0x'.concat('b'.repeat(66))).encodeABI();

        expect(test).toThrow();
      });
    });
  });
});
