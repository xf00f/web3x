import BN from "bn.js";
import { EventLog, TransactionReceipt } from "web3x-es/formatters";
import { Contract, ContractOptions, TxCall, TxSend, EventSubscriptionFactory } from "web3x-es/contract";
import { Eth } from "web3x-es/eth";
import abi from "./DaiContractAbi";
export type MintEvent = {
    guy: string;
    wad: string;
};
export type BurnEvent = {
    guy: string;
    wad: string;
};
export type LogSetAuthorityEvent = {
    authority: string;
};
export type LogSetOwnerEvent = {
    owner: string;
};
export type LogNoteEvent = {
    sig: string;
    guy: string;
    foo: string;
    bar: string;
    wad: string;
    fax: string;
};
export type ApprovalEvent = {
    src: string;
    guy: string;
    wad: string;
};
export type TransferEvent = {
    src: string;
    dst: string;
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
    approve(guy: string, wad: number | string | BN): TxSend<DaiContractTransactionReceipt>;
    setOwner(owner_: string): TxSend<DaiContractTransactionReceipt>;
    totalSupply(): TxCall<string>;
    transferFrom(src: string, dst: string, wad: number | string | BN): TxSend<DaiContractTransactionReceipt>;
    decimals(): TxCall<string>;
    mint(guy: string, wad: number | string | BN): TxSend<DaiContractTransactionReceipt>;
    burn(wad: number | string | BN): TxSend<DaiContractTransactionReceipt>;
    setName(name_: string): TxSend<DaiContractTransactionReceipt>;
    balanceOf(src: string): TxCall<string>;
    stopped(): TxCall<boolean>;
    setAuthority(authority_: string): TxSend<DaiContractTransactionReceipt>;
    owner(): TxCall<string>;
    symbol(): TxCall<string>;
    burn(guy: string, wad: number | string | BN): TxSend<DaiContractTransactionReceipt>;
    mint(wad: number | string | BN): TxSend<DaiContractTransactionReceipt>;
    transfer(dst: string, wad: number | string | BN): TxSend<DaiContractTransactionReceipt>;
    push(dst: string, wad: number | string | BN): TxSend<DaiContractTransactionReceipt>;
    move(src: string, dst: string, wad: number | string | BN): TxSend<DaiContractTransactionReceipt>;
    start(): TxSend<DaiContractTransactionReceipt>;
    authority(): TxCall<string>;
    approve(guy: string): TxSend<DaiContractTransactionReceipt>;
    allowance(src: string, guy: string): TxCall<string>;
    pull(src: string, wad: number | string | BN): TxSend<DaiContractTransactionReceipt>;
}
export interface DaiContractDefinition {
    methods: DaiContractMethods;
    events: DaiContractEvents;
    eventLogs: DaiContractEventLogs;
}
export class DaiContract extends Contract<DaiContractDefinition> {
    constructor(eth: Eth, address?: string, options?: ContractOptions) {
        super(eth, abi, address, options);
    }
}
export var DaiContractAbi = abi;
