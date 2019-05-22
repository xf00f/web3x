import { EvmContext } from '../vm/evm-context';
import { Add } from './add';
import { AddMod } from './addmod';
import { Address } from './address';
import { And } from './and';
import { Byte } from './byte';
import { Call } from './call';
import { CallDataCopy } from './calldatacopy';
import { CallDataLoad } from './calldataload';
import { CallDataSize } from './calldatasize';
import { Caller } from './caller';
import { CallValue } from './callvalue';
import { CodeSize } from './codesize';
import { Coinbase } from './coinbase';
import { CopyCode } from './copycode';
import { DelegateCall } from './delegatecall';
import { Difficulty } from './difficulty';
import { Div } from './div';
import { DupOps } from './dup';
import { Eq } from './eq';
import { Exp } from './exp';
import { ExtCodeSize } from './extcodesize';
import { Gas } from './gas';
import { GasLimit } from './gaslimit';
import { GasPrice } from './gasprice';
import { Gt } from './gt';
import { Invalid } from './invalid';
import { IsZero } from './iszero';
import { Jump } from './jump';
import { JumpDest } from './jumpdest';
import { Jumpi } from './jumpi';
import { LogOps } from './log';
import { Lt } from './lt';
import { Mload } from './mload';
import { Mod } from './mod';
import { Msize } from './msize';
import { Mstore } from './mstore';
import { Mstore8 } from './mstore8';
import { Mul } from './mul';
import { MulMod } from './mulmod';
import { Not } from './not';
import { BlockNumber } from './number';
import { Or } from './or';
import { Origin } from './origin';
import { Pc } from './pc';
import { Pop } from './pop';
import { PushOps } from './push';
import { Return } from './return';
import { ReturnDataCopy } from './returndatacopy';
import { ReturnDataSize } from './returndatasize';
import { Revert } from './revert';
import { Rol } from './rol';
import { Ror } from './ror';
import { Sdiv } from './sdiv';
import { Sgt } from './sgt';
import { Sha3 } from './sha3';
import { Shl } from './shl';
import { Shr } from './shr';
import { SignExtend } from './signextend';
import { Sload } from './sload';
import { Slt } from './slt';
import { Smod } from './smod';
import { Sstore } from './sstore';
import { StaticCall } from './staticcall';
import { Stop } from './stop';
import { Sub } from './sub';
import { SwapOps } from './swap';
import { Timestamp } from './timestamp';
import { Xor } from './xor';

export interface OpCode {
  readonly code: number;
  readonly mnemonic: string;
  readonly description: string;
  readonly gas: number;
  readonly bytes: number;

  handle(context: EvmContext): void | Promise<void>;
  toString(params: Buffer): string;
}

const opCodes: OpCode[] = [
  ...DupOps,
  ...LogOps,
  ...PushOps,
  ...SwapOps,
  Add,
  AddMod,
  Address,
  And,
  Byte,
  Call,
  Caller,
  CallDataCopy,
  CallDataLoad,
  CallDataSize,
  CallValue,
  CodeSize,
  Coinbase,
  CopyCode,
  DelegateCall,
  Difficulty,
  Div,
  Eq,
  Exp,
  ExtCodeSize,
  Gas,
  GasLimit,
  GasPrice,
  Gt,
  Invalid,
  IsZero,
  Jump,
  JumpDest,
  Jumpi,
  Lt,
  Mul,
  MulMod,
  Mod,
  Msize,
  Mstore8,
  BlockNumber,
  Or,
  Origin,
  Pc,
  Pop,
  Rol,
  Ror,
  Sdiv,
  Sgt,
  Shl,
  Shr,
  SignExtend,
  Slt,
  Smod,
  StaticCall,
  Timestamp,
  Mload,
  Mstore,
  Not,
  Return,
  ReturnDataCopy,
  ReturnDataSize,
  Revert,
  Sha3,
  Stop,
  Sload,
  Sstore,
  Sub,
  Xor,
];

export const OpCodes: { [code: number]: OpCode } = opCodes.reduce((a, c) => ({ ...a, [c.code]: c }), {});
