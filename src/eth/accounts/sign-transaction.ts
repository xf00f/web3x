import { Tx } from '../types';
import { formatters } from '../../core-helpers';
import { numberToHex, hexToNumber, isAddress } from '../../utils';
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

var isNot = function(value) {
  return value === undefined || value === null;
};

var trimLeadingZero = function(hex) {
  while (hex && hex.startsWith('0x0')) {
    hex = '0x' + hex.slice(3);
  }
  return hex;
};

var makeEven = function(hex) {
  if (hex.length % 2 === 1) {
    hex = hex.replace('0x', '0x0');
  }
  return hex;
};

export async function signTransaction(tx: Tx, privateKey: string, eth: Eth): Promise<SignedTx> {
  let result;
  let error: Error;

  function signed(tx) {
    if (!tx.gas && !tx.gasLimit) {
      error = new Error('"gas" is missing');
    }

    if (tx.nonce < 0 || tx.gas < 0 || tx.gasPrice < 0 || tx.chainId < 0) {
      error = new Error('Gas, gasPrice, nonce or chainId is lower than 0');
    }

    if (error) {
      throw error;
    }

    tx = formatters.inputCallFormatter(tx);

    var transaction = tx;
    transaction.to = tx.to || '0x';
    transaction.data = tx.data || '0x';
    transaction.value = tx.value || '0x';
    transaction.chainId = numberToHex(tx.chainId);

    var rlpEncoded = RLP.encode([
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

    var hash = Hash.keccak256(rlpEncoded);

    var signature = Account.makeSigner(Nat.toNumber(transaction.chainId || '0x1') * 2 + 35)(
      Hash.keccak256(rlpEncoded),
      privateKey,
    );

    var rawTx = RLP.decode(rlpEncoded)
      .slice(0, 6)
      .concat(Account.decodeSignature(signature));

    rawTx[6] = makeEven(trimLeadingZero(rawTx[6]));
    rawTx[7] = makeEven(trimLeadingZero(rawTx[7]));
    rawTx[8] = makeEven(trimLeadingZero(rawTx[8]));

    var rawTransaction = RLP.encode(rawTx);

    var values = RLP.decode(rawTransaction);
    result = {
      messageHash: hash,
      v: trimLeadingZero(values[6]),
      r: trimLeadingZero(values[7]),
      s: trimLeadingZero(values[8]),
      rawTransaction: rawTransaction,
    };

    return result;
  }

  // Resolve immediately if nonce, chainId and price are provided
  if (tx.nonce !== undefined && tx.chainId !== undefined && tx.gasPrice !== undefined) {
    return signed(tx);
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

  return signed(Object.assign(tx, { chainId, gasPrice, nonce }));
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
