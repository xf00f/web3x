import { Address } from '../../../types';
import { ContractAbi } from '../../../contract';

export interface RegistryDefinition {
  methods: {
    owner(node: string): Address;
    resolver(node: string): Address;
    ttl(node: string): number;
    setOwner(node: string, owner: Address): void;
    setSubNodeOwner(node: string, label: string, owner: Address): void;
    setResolver(node: string, resolver: Address): void;
    setTTL(node: string, ttl: number): void;
  };
  events: {
    Transfer: {
      node: string;
      owner: Address;
    }[];
    NewOwner: {
      node: string;
      label: string;
      owner: Address;
    }[];
    NewTTL: {
      node: string;
      ttl: number;
    }[];
  };
}

export const REGISTRY_ABI: ContractAbi = [
  {
    constant: true,
    inputs: [
      {
        name: 'node',
        type: 'bytes32',
      },
    ],
    name: 'resolver',
    outputs: [
      {
        name: '',
        type: 'address',
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
    name: 'owner',
    outputs: [
      {
        name: '',
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
        name: 'label',
        type: 'bytes32',
      },
      {
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'setSubnodeOwner',
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
        name: 'ttl',
        type: 'uint64',
      },
    ],
    name: 'setTTL',
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
    name: 'ttl',
    outputs: [
      {
        name: '',
        type: 'uint64',
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
        name: 'resolver',
        type: 'address',
      },
    ],
    name: 'setResolver',
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
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'setOwner',
    outputs: [],
    payable: false,
    type: 'function',
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
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'Transfer',
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
        name: 'label',
        type: 'bytes32',
      },
      {
        indexed: false,
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'NewOwner',
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
        name: 'resolver',
        type: 'address',
      },
    ],
    name: 'NewResolver',
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
        name: 'ttl',
        type: 'uint64',
      },
    ],
    name: 'NewTTL',
    type: 'event',
  },
];
/*

type AbiDataTypes = 'uint256' | 'boolean' | 'string' | 'bytes' | 'address' | 'bytes32';
type BaseInput = { components?: any; name: string; type: AbiDataTypes; indexed?: boolean };
interface Input<T extends AbiDataTypes> extends BaseInput {
  components?: any;
  name: string;
  type: T;
  indexed?: boolean;
}

type BaseFunction = {
  constant?: boolean;
  payable?: boolean;
  anonymous?: boolean;
  type: 'function';
  inputs: Input<AbiDataTypes>[];
  outputs?: Array<{ components?: any; name: string; type: AbiDataTypes }>;
  stateMutability?: 'pure' | 'view' | 'payable' | 'nonpayable';
  name: string;
};

interface FD1<Name extends string, A1 extends AbiDataTypes> extends BaseFunction {
  name: Name;
  inputs: [Input<A1>];
}
interface FD2<Name extends string, A1 extends AbiDataTypes, A2 extends AbiDataTypes> extends BaseFunction {
  name: Name;
  inputs: [Input<A1>, Input<A2>];
}

interface FD<Name extends string, Inputs extends Input<AbiDataTypes>[]> extends BaseFunction {
  name: Name;
  inputs: Inputs;
}

type TestAbi = [FD<'setOwner', [Input<'address'>, Input<'bytes32'>]>, FD<'owner', [Input<'bytes32'>]>];

let test: TestAbi = [
  {
    constant: false,
    inputs: [
      {
        name: 'owner',
        type: 'address',
      },
      {
        name: 'node',
        type: 'bytes32',
      },
    ],
    name: 'setOwner',
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
    name: 'owner',
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    payable: false,
    type: 'function',
  },
];

interface SFD<Inputs extends Input<AbiDataTypes>[]> extends BaseFunction {
  inputs: Inputs;
}

type TestAbi2 = {
  setOwner: SFD<InputTuple<['address', 'bytes32']>>;
  owner: SFD<InputTuple<['bytes32']>>;
};
let things = test.reduce((a, v) => ({ ...a, [v.name]: v }), {});

//type MapTuple<T,

type MapType<T> = T extends 'bytes32' ? Buffer : T extends 'address' ? string : never;
type ArgFromInput<I extends any> = MapType<I['type']>;

type AbiFunctions<T> = Extract<T, BaseFunction>;
//type RegistryAbiEvents<T> = Extract<T, BaseEvent>;

type Methods<T extends any[]> = {
  //[P in AbiFunctions<T[number]>['name']]: (a1: AbiFunctions<T[P]>['inputs'][0]['type']) => void
  //[P in AbiFunctions<T[number]>['name']]: (...a: ArgList<AbiFunctions<T[number]>['inputs']>) => void
};
type Y = Methods<TestAbi>;

const INVARIANT_MARKER = Symbol();
type Invariant<T> = {
  [INVARIANT_MARKER](t: T): T;
};

interface TypeFuncs<C, X> {}

const FUN_MARKER = Symbol();
type Fun<K extends keyof TypeFuncs<{}, {}>, C> = Invariant<[typeof FUN_MARKER, K, C]>;

const BAD_APP_MARKER = Symbol();
type BadApp<F, X> = Invariant<[typeof BAD_APP_MARKER, F, X]>;
type App<F, X> = [F] extends [Fun<infer K, infer C>] ? TypeFuncs<C, X>[K] : BadApp<F, X>;

const BAD_MAP_TUPLE = Symbol();
type MapTuple<F, T> = [T] extends never[]
  ? never[]
  : [T] extends [[infer T1]]
    ? [App<F, T1>]
    : [T] extends [[infer T1, infer T2]]
      ? [App<F, T1>, App<F, T2>]
      : [T] extends [[infer T1, infer T2, infer T3]]
        ? [App<F, T1>, App<F, T2>, App<F, T3>]
        : [T] extends [[infer T1, infer T2, infer T3, infer T4]]
          ? [App<F, T1>, App<F, T2>, App<F, T3>, App<F, T4>]
          : [T] extends [[infer T1, infer T2, infer T3, infer T4, infer T5]]
            ? [App<F, T1>, App<F, T2>, App<F, T3>, App<F, T4>, App<F, T5>]
            : [T] extends [[infer T1, infer T2, infer T3, infer T4, infer T5, infer T6]]
              ? [App<F, T1>, App<F, T2>, App<F, T3>, App<F, T4>, App<F, T5>, App<F, T6>]
              : [T] extends [[infer T1, infer T2, infer T3, infer T4, infer T5, infer T6, infer T7]]
                ? [App<F, T1>, App<F, T2>, App<F, T3>, App<F, T4>, App<F, T5>, App<F, T6>, App<F, T7>]
                : [T] extends [[infer T1, infer T2, infer T3, infer T4, infer T5, infer T6, infer T7, infer T8]]
                  ? [App<F, T1>, App<F, T2>, App<F, T3>, App<F, T4>, App<F, T5>, App<F, T6>, App<F, T8>]
                  : Invariant<[typeof BAD_MAP_TUPLE, F, T]>;

//type PromiseTuple<T extends any[]> = [Promise<E> for E in T];
const F_WrapInputType = Symbol();
const F_ArgList = Symbol();
interface TypeFuncs<C, X> {
  [F_WrapInputType]: Input<X>;
  [F_ArgList]: ArgFromInput<X>;
}

type F_WrapInputType = Fun<typeof F_WrapInputType, never>;
type InputTuple<T> = MapTuple<F_WrapInputType, T>;

type F_ArgList = Fun<typeof F_ArgList, never>;
type ArgList<T> = MapTuple<F_ArgList, T>;

type T1 = InputTuple<['hello', 'world']>;
type T2 = ArgList<TestAbi[0]['inputs']>;
*/
