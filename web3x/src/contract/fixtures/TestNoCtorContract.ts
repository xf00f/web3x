import BN from "bn.js";
import { Address } from "../../address";
import { EventLog, TransactionReceipt } from "../../formatters";
import { Contract, ContractOptions, TxCall, TxSend, EventSubscriptionFactory } from "../../contract";
import { Eth } from "../../eth";
import abi from "./TestNoCtorContractAbi";
interface TestNoCtorContractEvents {
}
interface TestNoCtorContractEventLogs {
}
interface TestNoCtorContractTxEventLogs {
}
export interface TestNoCtorContractTransactionReceipt extends TransactionReceipt<TestNoCtorContractTxEventLogs> {
}
interface TestNoCtorContractMethods {
    addStruct(nestedStruct: {
        status: boolean;
    }): TxSend<TestNoCtorContractTransactionReceipt>;
}
export interface TestNoCtorContractDefinition {
    methods: TestNoCtorContractMethods;
    events: TestNoCtorContractEvents;
    eventLogs: TestNoCtorContractEventLogs;
}
export class TestNoCtorContract extends Contract<TestNoCtorContractDefinition> {
    constructor(eth: Eth, address?: Address, options?: ContractOptions) {
        super(eth, abi, address, options);
    }
    deploy(): TxSend<TestNoCtorContractTransactionReceipt> {
        return super.deployBytecode("0x01234567") as any;
    }
}
export var TestNoCtorContractAbi = abi;
