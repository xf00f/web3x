import BN from "bn.js";
import { EventLog, TransactionReceipt } from "../../formatters";
import { Contract, ContractOptions, ContractAbi, TxCall, TxSend, EventSubscriptionFactory } from "../../contract";
import { Eth } from "../../eth";
import abi from "./EnsRegistryAbi";
export type TransferEvent = {
    node: string;
    owner: string;
};
export type NewOwnerEvent = {
    node: string;
    label: string;
    owner: string;
};
export type NewResolverEvent = {
    node: string;
    resolver: string;
};
export type NewTTLEvent = {
    node: string;
    ttl: string;
};
export interface TransferEventLog extends EventLog<TransferEvent, "Transfer"> {
}
export interface NewOwnerEventLog extends EventLog<NewOwnerEvent, "NewOwner"> {
}
export interface NewResolverEventLog extends EventLog<NewResolverEvent, "NewResolver"> {
}
export interface NewTTLEventLog extends EventLog<NewTTLEvent, "NewTTL"> {
}
interface EnsRegistryEvents {
    Transfer: EventSubscriptionFactory<TransferEventLog>;
    NewOwner: EventSubscriptionFactory<NewOwnerEventLog>;
    NewResolver: EventSubscriptionFactory<NewResolverEventLog>;
    NewTTL: EventSubscriptionFactory<NewTTLEventLog>;
}
interface EnsRegistryEventLogs {
    Transfer: TransferEventLog;
    NewOwner: NewOwnerEventLog;
    NewResolver: NewResolverEventLog;
    NewTTL: NewTTLEventLog;
}
interface EnsRegistryTxEventLogs {
    Transfer: TransferEventLog[];
    NewOwner: NewOwnerEventLog[];
    NewResolver: NewResolverEventLog[];
    NewTTL: NewTTLEventLog[];
}
export interface EnsRegistryTransactionReceipt extends TransactionReceipt<EnsRegistryTxEventLogs> {
}
interface EnsRegistryMethods {
    resolver(node: string): TxCall<string>;
    owner(node: string): TxCall<string>;
    setSubnodeOwner(node: string, label: string, owner: string): TxSend<EnsRegistryTransactionReceipt>;
    setTTL(node: string, ttl: number | string | BN): TxSend<EnsRegistryTransactionReceipt>;
    ttl(node: string): TxCall<string>;
    setResolver(node: string, resolver: string): TxSend<EnsRegistryTransactionReceipt>;
    setOwner(node: string, owner: string): TxSend<EnsRegistryTransactionReceipt>;
}
export interface EnsRegistryDefinition {
    methods: EnsRegistryMethods;
    events: EnsRegistryEvents;
    eventLogs: EnsRegistryEventLogs;
}
export class EnsRegistry extends Contract<EnsRegistryDefinition> {
    constructor(eth: Eth, address?: string, options?: ContractOptions) {
        super(eth, abi, address, options);
    }
}
export var EnsRegistryAbi = abi;
