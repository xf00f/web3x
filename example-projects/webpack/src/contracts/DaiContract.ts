import BN from 'bn.js';
import { Contract, ContractOptions, ContractAbi } from 'web3x-es/contract';
import { Eth } from 'web3x-es/eth';
import abi from './DaiContract.abi.json';
interface DaiContractMethods {
    name(): string;
    stop(): void;
    approve(guy: string, wad: number | string | BN): void;
    setOwner(owner_: string): void;
    totalSupply(): string;
    transferFrom(src: string, dst: string, wad: number | string | BN): void;
    decimals(): string;
    mint(guy: string, wad: number | string | BN): void;
    burn(wad: number | string | BN): void;
    setName(name_: string): void;
    balanceOf(src: string): string;
    stopped(): boolean;
    setAuthority(authority_: string): void;
    owner(): string;
    symbol(): string;
    burn(guy: string, wad: number | string | BN): void;
    mint(wad: number | string | BN): void;
    transfer(dst: string, wad: number | string | BN): void;
    push(dst: string, wad: number | string | BN): void;
    move(src: string, dst: string, wad: number | string | BN): void;
    start(): void;
    authority(): string;
    approve(guy: string): void;
    allowance(src: string, guy: string): string;
    pull(src: string, wad: number | string | BN): void;
}
interface DaiContractEvents {
    Mint: {
        guy: string;
        wad: string;
    };
    Burn: {
        guy: string;
        wad: string;
    };
    LogSetAuthority: {
        authority: string;
    };
    LogSetOwner: {
        owner: string;
    };
    LogNote: {
        sig: string;
        guy: string;
        foo: string;
        bar: string;
        wad: string;
        fax: string;
    };
    Approval: {
        src: string;
        guy: string;
        wad: string;
    };
    Transfer: {
        src: string;
        dst: string;
        wad: string;
    };
}
export interface DaiContractDefinition {
    methods: DaiContractMethods;
    events: DaiContractEvents;
}
export class DaiContract extends Contract<DaiContractDefinition> {
    constructor(eth: Eth, address?: string, options?: ContractOptions) {
        super(eth, (abi as ContractAbi), address, options);
    }
}
