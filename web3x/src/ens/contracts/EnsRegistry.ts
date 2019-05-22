import BN from "bn.js";
import { Address } from "../../address";
import { EventLog, TransactionReceipt } from "../../formatters";
import { Contract, ContractOptions, TxCall, TxSend, EventSubscriptionFactory } from "../../contract";
import { Eth } from "../../eth";
import abi from "./EnsRegistryAbi";
export type TransferEvent = {
    node: string;
    owner: Address;
};
export type NewOwnerEvent = {
    node: string;
    label: string;
    owner: Address;
};
export type NewResolverEvent = {
    node: string;
    resolver: Address;
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
    resolver(node: string): TxCall<Address>;
    owner(node: string): TxCall<Address>;
    setSubnodeOwner(node: string, label: string, owner: Address): TxSend<EnsRegistryTransactionReceipt>;
    setTTL(node: string, ttl: number | string | BN): TxSend<EnsRegistryTransactionReceipt>;
    ttl(node: string): TxCall<string>;
    setResolver(node: string, resolver: Address): TxSend<EnsRegistryTransactionReceipt>;
    setOwner(node: string, owner: Address): TxSend<EnsRegistryTransactionReceipt>;
}
export interface EnsRegistryDefinition {
    methods: EnsRegistryMethods;
    events: EnsRegistryEvents;
    eventLogs: EnsRegistryEventLogs;
}
export class EnsRegistry extends Contract<EnsRegistryDefinition> {
    constructor(eth: Eth, address?: Address, options?: ContractOptions) {
        super(eth, abi, address, options);
    }
}
export var EnsRegistryAbi = abi;
