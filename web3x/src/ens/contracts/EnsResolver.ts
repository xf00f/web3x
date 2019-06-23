import BN from "bn.js";
import { Address } from "../../address";
import { EventLog, TransactionReceipt } from "../../formatters";
import { Contract, ContractOptions, TxCall, TxSend, EventSubscriptionFactory } from "../../contract";
import { Eth } from "../../eth";
import abi from "./EnsResolverAbi";
export type AddrChangedEvent = {
    node: string;
    a: Address;
};
export type ContentChangedEvent = {
    node: string;
    hash: string;
};
export type NameChangedEvent = {
    node: string;
    name: string;
};
export type ABIChangedEvent = {
    node: string;
    contentType: string;
};
export type PubkeyChangedEvent = {
    node: string;
    x: string;
    y: string;
};
export interface AddrChangedEventLog extends EventLog<AddrChangedEvent, "AddrChanged"> {
}
export interface ContentChangedEventLog extends EventLog<ContentChangedEvent, "ContentChanged"> {
}
export interface NameChangedEventLog extends EventLog<NameChangedEvent, "NameChanged"> {
}
export interface ABIChangedEventLog extends EventLog<ABIChangedEvent, "ABIChanged"> {
}
export interface PubkeyChangedEventLog extends EventLog<PubkeyChangedEvent, "PubkeyChanged"> {
}
interface EnsResolverEvents {
    AddrChanged: EventSubscriptionFactory<AddrChangedEventLog>;
    ContentChanged: EventSubscriptionFactory<ContentChangedEventLog>;
    NameChanged: EventSubscriptionFactory<NameChangedEventLog>;
    ABIChanged: EventSubscriptionFactory<ABIChangedEventLog>;
    PubkeyChanged: EventSubscriptionFactory<PubkeyChangedEventLog>;
}
interface EnsResolverEventLogs {
    AddrChanged: AddrChangedEventLog;
    ContentChanged: ContentChangedEventLog;
    NameChanged: NameChangedEventLog;
    ABIChanged: ABIChangedEventLog;
    PubkeyChanged: PubkeyChangedEventLog;
}
interface EnsResolverTxEventLogs {
    AddrChanged: AddrChangedEventLog[];
    ContentChanged: ContentChangedEventLog[];
    NameChanged: NameChangedEventLog[];
    ABIChanged: ABIChangedEventLog[];
    PubkeyChanged: PubkeyChangedEventLog[];
}
export interface EnsResolverTransactionReceipt extends TransactionReceipt<EnsResolverTxEventLogs> {
}
interface EnsResolverMethods {
    supportsInterface(interfaceID: string): TxCall<boolean>;
    ABI(node: string, contentTypes: number | string | BN): TxCall<[string, string]>;
    setMultihash(node: string, hash: string): TxSend<EnsResolverTransactionReceipt>;
    multihash(node: string): TxCall<string>;
    setPubkey(node: string, x: string, y: string): TxSend<EnsResolverTransactionReceipt>;
    content(node: string): TxCall<string>;
    addr(node: string): TxCall<Address>;
    setABI(node: string, contentType: number | string | BN, data: string): TxSend<EnsResolverTransactionReceipt>;
    name(node: string): TxCall<string>;
    setName(node: string, name: string): TxSend<EnsResolverTransactionReceipt>;
    setContent(node: string, hash: string): TxSend<EnsResolverTransactionReceipt>;
    pubkey(node: string): TxCall<[string, string]>;
    setAddr(node: string, addr: Address): TxSend<EnsResolverTransactionReceipt>;
}
export interface EnsResolverDefinition {
    methods: EnsResolverMethods;
    events: EnsResolverEvents;
    eventLogs: EnsResolverEventLogs;
}
export class EnsResolver extends Contract<EnsResolverDefinition> {
    constructor(eth: Eth, address?: Address, options?: ContractOptions) {
        super(eth, abi, address, options);
    }
}
export var EnsResolverAbi = abi;
