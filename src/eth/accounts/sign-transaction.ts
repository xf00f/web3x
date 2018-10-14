import { Tx } from '../../types';
import { formatters } from '../../core-helpers';
import { numberToHex } from '../../utils';
import RLP from '../../eth-lib/rlp';
import Bytes from '../../eth-lib/bytes';
import Hash from '../../eth-lib/hash';
import Nat from '../../eth-lib/nat';
import Account from '../../eth-lib/account';
import { Eth } from '..';

export interface SignedTx {
  messageHash: string;
  v: string;
  r: string;
  s: string;
  rawTransaction: string;
  chainId?: any;
  gasPrice?: any;
  nonce?: number;
}

export async function signTransaction(tx: Tx, privateKey: string, eth: Eth): Promise<SignedTx> {
  // Resolve immediately if nonce, chainId and price are provided
  if (tx.nonce !== undefined && tx.chainId !== undefined && tx.gasPrice !== undefined) {
    return signed(tx, privateKey);
  }

  // Otherwise, get the missing info from the Ethereum Node
  const promises: any = [
    isNot(tx.chainId) ? eth.getId() : tx.chainId,
    isNot(tx.gasPrice) ? eth.getGasPrice() : tx.gasPrice,
    isNot(tx.nonce) ? eth.getTransactionCount(Account.fromPrivate(privateKey).address) : tx.nonce,
  ];

  const [chainId, gasPrice, nonce] = await Promise.all(promises);

  if (isNot(chainId) || isNot(gasPrice) || isNot(nonce)) {
    throw new Error('One of the values "chainId", "gasPrice", or "nonce" couldn\'t be fetched');
  }

  return signed(Object.assign(tx, { chainId, gasPrice, nonce }), privateKey);
}

export function recoverTransaction(rawTx: string): string {
  var values = RLP.decode(rawTx);
  var signature = Account.encodeSignature(values.slice(6, 9));
  var recovery = Bytes.toNumber(values[6]);
  var extraData = recovery < 35 ? [] : [Bytes.fromNumber((recovery - 35) >> 1), '0x', '0x'];
  var signingData = values.slice(0, 6).concat(extraData);
  var signingDataHex = RLP.encode(signingData);
  return Account.recover(Hash.keccak256(signingDataHex), signature);
}

function signed(tx, privateKey: string): SignedTx {
  if (!tx.gas && !tx.gasLimit) {
    throw new Error('"gas" is missing');
  }

  if (tx.nonce < 0 || tx.gas < 0 || tx.gasPrice < 0 || tx.chainId < 0) {
    throw new Error('Gas, gasPrice, nonce or chainId is lower than 0');
  }

  tx = formatters.inputCallFormatter(tx);

  const transaction = tx;
  transaction.to = tx.to || '0x';
  transaction.data = tx.data || '0x';
  transaction.value = tx.value || '0x';
  transaction.chainId = numberToHex(tx.chainId);

  const rlpEncoded = RLP.encode([
    Bytes.fromNat(transaction.nonce),
    Bytes.fromNat(transaction.gasPrice),
    Bytes.fromNat(transaction.gas),
    transaction.to.toLowerCase(),
    Bytes.fromNat(transaction.value),
    transaction.data,
    Bytes.fromNat(transaction.chainId || '0x1'),
    '0x',
    '0x',
  ]);

  const messageHash = Hash.keccak256(rlpEncoded);

  const signature = Account.makeSigner(Nat.toNumber(transaction.chainId || '0x1') * 2 + 35)(
    Hash.keccak256(rlpEncoded),
    privateKey,
  );

  const rawTx = RLP.decode(rlpEncoded)
    .slice(0, 6)
    .concat(Account.decodeSignature(signature));

  rawTx[6] = makeEven(trimLeadingZero(rawTx[6]));
  rawTx[7] = makeEven(trimLeadingZero(rawTx[7]));
  rawTx[8] = makeEven(trimLeadingZero(rawTx[8]));

  const rawTransaction = RLP.encode(rawTx);

  const values = RLP.decode(rawTransaction);

  return {
    messageHash,
    v: trimLeadingZero(values[6]),
    r: trimLeadingZero(values[7]),
    s: trimLeadingZero(values[8]),
    rawTransaction,
  };
}

function isNot(value) {
  return value === undefined || value === null;
}

function trimLeadingZero(hex) {
  while (hex && hex.startsWith('0x0')) {
    hex = '0x' + hex.slice(3);
  }
  return hex;
}

function makeEven(hex) {
  if (hex.length % 2 === 1) {
    hex = hex.replace('0x', '0x0');
  }
  return hex;
}
