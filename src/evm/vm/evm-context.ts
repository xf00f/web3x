import { Address } from '../../address';
import { EvmMemory } from '../memory';
import { Stack } from '../stack';
import { Trie } from '../trie';
import { TxSubstrate } from '../tx/tx-substrate';
import { WorldState } from '../world/world-state';

export class ExecutionError extends Error {
  constructor(message: string, public instructionNumber?: number) {
    super(`${message} (instruction ${instructionNumber})`);
  }
}

export class EvmContext {
  public stack = new Stack<bigint>();
  public memory = new EvmMemory();
  public ip = 0;
  public halt = false;
  public reverted = false;
  public revertInstruction = 0;
  public returned = Buffer.of();
  public lastReturned = Buffer.of();
  public error?: Error;

  constructor(
    public worldState: WorldState,
    public code: Buffer = Buffer.of(),
    public calldata: Buffer = Buffer.of(),
    public origin: Address = Address.ZERO,
    public caller: Address = Address.ZERO,
    public executor: Address = Address.ZERO,
    public transferValue: bigint = BigInt(0),
    public executionValue: bigint = BigInt(0),
    public availableGas: bigint = BigInt(0),
    public gasPrice: bigint = BigInt(0),
    public storage: Trie = new Trie(),
    public callDepth: number = 0,
    public modify: boolean = true,
    public txSubstrate: TxSubstrate = new TxSubstrate(),
  ) {}
}
