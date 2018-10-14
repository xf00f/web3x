import { hashMessage } from './hash-message';
import { sign as ethLibSign, recover as ethLibRecover, encodeSignature, decodeSignature } from '../eth-lib/account';

export interface Signature {
  message: string;
  messageHash: string;
  r: string;
  s: string;
  v: string;
  signature: string;
}

export function sign(data: string, privateKey: string): Signature {
  var messageHash = hashMessage(data);
  var signature = ethLibSign(messageHash, privateKey);
  var vrs = decodeSignature(signature);
  return {
    message: data,
    messageHash,
    v: vrs[0],
    r: vrs[1],
    s: vrs[2],
    signature,
  };
}

export function recoverFromSignature(signature: Signature): string {
  const { messageHash, v, r, s } = signature;
  return recoverFromSigString(messageHash, encodeSignature([v, r, s]), true);
}

export function recoverFromVRS(message: string, v: string, r: string, s: string, prefixed: boolean = false): string {
  if (!prefixed) {
    message = hashMessage(message);
  }
  return recoverFromSigString(message, encodeSignature([v, r, s]), true);
}

export function recoverFromSigString(message: string, signature: string, preFixed: boolean = false) {
  if (!preFixed) {
    message = hashMessage(message);
  }

  return ethLibRecover(message, signature);
}

export function recover(signature: Signature): string;
export function recover(message: string, v: string, r: string, s: string, prefixed?: boolean): string;
export function recover(message: string, signature: string, preFixed?: boolean);
export function recover(...args: any[]): string {
  switch (args.length) {
    case 1:
      return recoverFromSignature(args[0]);
    case 2:
    case 3:
      return recoverFromSigString(args[0], args[1], args[2]);
    case 4:
    case 5:
      return recoverFromVRS(args[0], args[1], args[2], args[3], args[4]);
  }
  throw new Error('Cannot determine recovery function');
}
