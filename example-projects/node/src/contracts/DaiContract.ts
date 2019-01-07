import BN from "bn.js";
import { Address } from "web3x/address";
import { EventLog, TransactionReceipt } from "web3x/formatters";
import { Contract, ContractOptions, TxCall, TxSend, EventSubscriptionFactory } from "web3x/contract";
import { Eth } from "web3x/eth";
import abi from "./DaiContractAbi";
export type MintEvent = {
    guy: Address;
    wad: string;
};
export type BurnEvent = {
    guy: Address;
    wad: string;
};
export type LogSetAuthorityEvent = {
    authority: Address;
};
export type LogSetOwnerEvent = {
    owner: Address;
};
export type LogNoteEvent = {
    sig: string;
    guy: Address;
    foo: string;
    bar: string;
    wad: string;
    fax: string;
};
export type ApprovalEvent = {
    src: Address;
    guy: Address;
    wad: string;
};
export type TransferEvent = {
    src: Address;
    dst: Address;
    wad: string;
};
export interface MintEventLog extends EventLog<MintEvent, "Mint"> {
}
export interface BurnEventLog extends EventLog<BurnEvent, "Burn"> {
}
export interface LogSetAuthorityEventLog extends EventLog<LogSetAuthorityEvent, "LogSetAuthority"> {
}
export interface LogSetOwnerEventLog extends EventLog<LogSetOwnerEvent, "LogSetOwner"> {
}
export interface LogNoteEventLog extends EventLog<LogNoteEvent, "LogNote"> {
}
export interface ApprovalEventLog extends EventLog<ApprovalEvent, "Approval"> {
}
export interface TransferEventLog extends EventLog<TransferEvent, "Transfer"> {
}
interface DaiContractEvents {
    Mint: EventSubscriptionFactory<MintEventLog>;
    Burn: EventSubscriptionFactory<BurnEventLog>;
    LogSetAuthority: EventSubscriptionFactory<LogSetAuthorityEventLog>;
    LogSetOwner: EventSubscriptionFactory<LogSetOwnerEventLog>;
    LogNote: EventSubscriptionFactory<LogNoteEventLog>;
    Approval: EventSubscriptionFactory<ApprovalEventLog>;
    Transfer: EventSubscriptionFactory<TransferEventLog>;
}
interface DaiContractEventLogs {
    Mint: MintEventLog;
    Burn: BurnEventLog;
    LogSetAuthority: LogSetAuthorityEventLog;
    LogSetOwner: LogSetOwnerEventLog;
    LogNote: LogNoteEventLog;
    Approval: ApprovalEventLog;
    Transfer: TransferEventLog;
}
interface DaiContractTxEventLogs {
    Mint: MintEventLog[];
    Burn: BurnEventLog[];
    LogSetAuthority: LogSetAuthorityEventLog[];
    LogSetOwner: LogSetOwnerEventLog[];
    LogNote: LogNoteEventLog[];
    Approval: ApprovalEventLog[];
    Transfer: TransferEventLog[];
}
export interface DaiContractTransactionReceipt extends TransactionReceipt<DaiContractTxEventLogs> {
}
interface DaiContractMethods {
    name(): TxCall<string>;
    stop(): TxSend<DaiContractTransactionReceipt>;
    approve(guy: Address, wad: number | string | BN): TxSend<DaiContractTransactionReceipt>;
    setOwner(owner_: Address): TxSend<DaiContractTransactionReceipt>;
    totalSupply(): TxCall<string>;
    transferFrom(src: Address, dst: Address, wad: number | string | BN): TxSend<DaiContractTransactionReceipt>;
    decimals(): TxCall<string>;
    mint(guy: Address, wad: number | string | BN): TxSend<DaiContractTransactionReceipt>;
    burn(wad: number | string | BN): TxSend<DaiContractTransactionReceipt>;
    setName(name_: string): TxSend<DaiContractTransactionReceipt>;
    balanceOf(src: Address): TxCall<string>;
    stopped(): TxCall<boolean>;
    setAuthority(authority_: Address): TxSend<DaiContractTransactionReceipt>;
    owner(): TxCall<Address>;
    symbol(): TxCall<string>;
    burn(guy: Address, wad: number | string | BN): TxSend<DaiContractTransactionReceipt>;
    mint(wad: number | string | BN): TxSend<DaiContractTransactionReceipt>;
    transfer(dst: Address, wad: number | string | BN): TxSend<DaiContractTransactionReceipt>;
    push(dst: Address, wad: number | string | BN): TxSend<DaiContractTransactionReceipt>;
    move(src: Address, dst: Address, wad: number | string | BN): TxSend<DaiContractTransactionReceipt>;
    start(): TxSend<DaiContractTransactionReceipt>;
    authority(): TxCall<Address>;
    approve(guy: Address): TxSend<DaiContractTransactionReceipt>;
    allowance(src: Address, guy: Address): TxCall<string>;
    pull(src: Address, wad: number | string | BN): TxSend<DaiContractTransactionReceipt>;
}
export interface DaiContractDefinition {
    methods: DaiContractMethods;
    events: DaiContractEvents;
    eventLogs: DaiContractEventLogs;
}
export class DaiContract extends Contract<DaiContractDefinition> {
    constructor(eth: Eth, address?: Address, options?: ContractOptions) {
        super(eth, abi, address, options);
    }
}
export var DaiContractAbi = abi;
