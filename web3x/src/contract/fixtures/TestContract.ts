import BN from "bn.js";
import { Address } from "../../address";
import { EventLog, TransactionReceipt } from "../../formatters";
import { Contract, ContractOptions, TxCall, TxSend, EventSubscriptionFactory } from "../../contract";
import { Eth } from "../../eth";
import abi from "./TestContractAbi";
export type ChangedEvent = {
    from: Address;
    amount: string;
    t1: string;
    t2: string;
};
export type UnchangedEvent = {
    value: string;
    addressFrom: Address;
    t1: string;
};
export interface ChangedEventLog extends EventLog<ChangedEvent, "Changed"> {
}
export interface UnchangedEventLog extends EventLog<UnchangedEvent, "Unchanged"> {
}
interface TestContractEvents {
    Changed: EventSubscriptionFactory<ChangedEventLog>;
    Unchanged: EventSubscriptionFactory<UnchangedEventLog>;
}
interface TestContractEventLogs {
    Changed: ChangedEventLog;
    Unchanged: UnchangedEventLog;
}
interface TestContractTxEventLogs {
    Changed: ChangedEventLog[];
    Unchanged: UnchangedEventLog[];
}
export interface TestContractTransactionReceipt extends TransactionReceipt<TestContractTxEventLogs> {
}
interface TestContractMethods {
    addStruct(nestedStruct: {
        status: boolean;
    }): TxSend<TestContractTransactionReceipt>;
    listOfNestedStructs(a0: Address): TxCall<{
        status: boolean;
    }>;
    balance(who: Address): TxCall<string>;
    hasALotOfParams(_var1: string, _var2: string, _var3: string[]): TxCall<Address>;
    getStr(): TxCall<string>;
    owner(): TxCall<Address>;
    mySend(to: Address, value: number | string | BN): TxSend<TestContractTransactionReceipt>;
    myDisallowedSend(to: Address, value: number | string | BN): TxSend<TestContractTransactionReceipt>;
    testArr(value: (number | string | BN)[]): TxCall<string>;
    overloadedFunction(a: number | string | BN): TxCall<string>;
    overloadedFunction(): TxCall<string>;
}
export interface TestContractDefinition {
    methods: TestContractMethods;
    events: TestContractEvents;
    eventLogs: TestContractEventLogs;
}
export class TestContract extends Contract<TestContractDefinition> {
    constructor(eth: Eth, address?: Address, options?: ContractOptions) {
        super(eth, abi, address, options);
    }
    deploy(who: Address, myValue: number | string | BN): TxSend<TestContractTransactionReceipt> {
        return super.deployBytecode("0x01234567", who, myValue) as any;
    }
}
export var TestContractAbi = abi;
