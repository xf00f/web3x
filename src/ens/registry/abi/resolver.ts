import { ContractAbi } from '../../../contract';
import { Address } from '../../../types';

export interface ResolverDefinition {
  methods: {
    supportsInterface(interfaceId: string): boolean;
    ABI(node: string, contentType: number): { contentType: number; data: string };
    setABI(node: string, contentTypes: number, data: string): void;
    multihash(node: string): string;
    setMultihash(node: string, hash: string): void;
    content(node: string): string;
    setContent(node: string, hash: string): void;
    addr(node: string): string;
    setAddr(node: string, addr: string): void;
    name(node: string): string;
    setName(node: string, name: string): void;
    pubkey(node: string): { x: string; y: string };
    setPubkey(node: string, x: string, y: string): void;
  };
  events: {
    AddrChanged: {
      node: string;
      a: Address;
    };
    ContentChanged: {
      node: string;
      hash: string;
    };
    NameChanged: {
      node: string;
      name: string;
    };
    ABIChanged: {
      node: string;
      contentType: string;
    };
    PubkeyChanged: {
      node: string;
      x: string;
      y: string;
    };
  };
}

export const RESOLVER_ABI: ContractAbi = [
  {
    constant: true,
    inputs: [
      {
        name: 'interfaceID',
        type: 'bytes4',
      },
    ],
    name: 'supportsInterface',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'node',
        type: 'bytes32',
      },
      {
        name: 'contentTypes',
        type: 'uint256',
      },
    ],
    name: 'ABI',
    outputs: [
      {
        name: 'contentType',
        type: 'uint256',
      },
      {
        name: 'data',
        type: 'bytes',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'node',
        type: 'bytes32',
      },
      {
        name: 'hash',
        type: 'bytes',
      },
    ],
    name: 'setMultihash',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'node',
        type: 'bytes32',
      },
    ],
    name: 'multihash',
    outputs: [
      {
        name: '',
        type: 'bytes',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'node',
        type: 'bytes32',
      },
      {
        name: 'x',
        type: 'bytes32',
      },
      {
        name: 'y',
        type: 'bytes32',
      },
    ],
    name: 'setPubkey',
    outputs: [],
    payable: false,
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'node',
        type: 'bytes32',
      },
    ],
    name: 'content',
    outputs: [
      {
        name: 'ret',
        type: 'bytes32',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'node',
        type: 'bytes32',
      },
    ],
    name: 'addr',
    outputs: [
      {
        name: 'ret',
        type: 'address',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'node',
        type: 'bytes32',
      },
      {
        name: 'contentType',
        type: 'uint256',
      },
      {
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'setABI',
    outputs: [],
    payable: false,
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'node',
        type: 'bytes32',
      },
    ],
    name: 'name',
    outputs: [
      {
        name: 'ret',
        type: 'string',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'node',
        type: 'bytes32',
      },
      {
        name: 'name',
        type: 'string',
      },
    ],
    name: 'setName',
    outputs: [],
    payable: false,
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'node',
        type: 'bytes32',
      },
      {
        name: 'hash',
        type: 'bytes32',
      },
    ],
    name: 'setContent',
    outputs: [],
    payable: false,
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'node',
        type: 'bytes32',
      },
    ],
    name: 'pubkey',
    outputs: [
      {
        name: 'x',
        type: 'bytes32',
      },
      {
        name: 'y',
        type: 'bytes32',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'node',
        type: 'bytes32',
      },
      {
        name: 'addr',
        type: 'address',
      },
    ],
    name: 'setAddr',
    outputs: [],
    payable: false,
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'ensAddr',
        type: 'address',
      },
    ],
    payable: false,
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'node',
        type: 'bytes32',
      },
      {
        indexed: false,
        name: 'a',
        type: 'address',
      },
    ],
    name: 'AddrChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'node',
        type: 'bytes32',
      },
      {
        indexed: false,
        name: 'hash',
        type: 'bytes32',
      },
    ],
    name: 'ContentChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'node',
        type: 'bytes32',
      },
      {
        indexed: false,
        name: 'name',
        type: 'string',
      },
    ],
    name: 'NameChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'node',
        type: 'bytes32',
      },
      {
        indexed: true,
        name: 'contentType',
        type: 'uint256',
      },
    ],
    name: 'ABIChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'node',
        type: 'bytes32',
      },
      {
        indexed: false,
        name: 'x',
        type: 'bytes32',
      },
      {
        indexed: false,
        name: 'y',
        type: 'bytes32',
      },
    ],
    name: 'PubkeyChanged',
    type: 'event',
  },
];
