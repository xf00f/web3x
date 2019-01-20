import { Address } from '../address';
import { EvmMemory } from './memory';
import { Stack } from './stack';
import { Trie } from './trie/trie';
import { WorldState } from './world';

export class EvmContext {
  public stack = new Stack<bigint>();
  public memory = new EvmMemory();
  public ip = 0;
  public halt = false;
  public reverted = false;
  public returned = Buffer.of();
  public lastReturned = Buffer.of();

  constructor(
    public worldState: WorldState,
    public code: Buffer = Buffer.of(),
    public calldata: Buffer = Buffer.of(),
    public sender: Address = Address.ZERO,
    public caller: Address = Address.ZERO,
    public executor: Address = Address.ZERO,
    public value: bigint = BigInt(0),
    public gas: bigint = BigInt(0),
    public storage: Trie = new Trie(),
  ) {}
}
