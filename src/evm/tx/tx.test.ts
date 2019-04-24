import { Account } from '../../account';
import { sign, SignTransactionRequest } from '../../account/sign-transaction';
import { Address } from '../../address';
import { recoverTransactionSender, Tx } from './tx';

describe('tx', () => {
  it('should recover correct address', () => {
    const fromAccount = Account.create();
    const chainId = 1;
    const nonce = 0;
    const gasPrice = 20000000000;
    const gasLimit = 21000;
    const to = Address.fromString('0xF0109fC8DF283027b6285cc889F5aA624EaC1F55');
    const value = 1000000000;
    const dataOrInit = Buffer.of();

    const signTxRequest: SignTransactionRequest = {
      chainId,
      to,
      gas: gasLimit,
      gasPrice,
      value,
      data: dataOrInit,
      nonce,
    };

    // TODO: Move sign function somewhere better (out of account module)?
    const { v, r, s } = sign(signTxRequest, fromAccount.privateKey);

    const tx: Tx = {
      nonce: BigInt(nonce),
      gasPrice: BigInt(gasPrice),
      gasLimit: BigInt(gasLimit),
      to,
      value: BigInt(value),
      dataOrInit,
      v,
      r,
      s,
    };

    const recovered = recoverTransactionSender(tx);

    expect(recovered).toEqual(fromAccount.address);
  });
});
