import { promiEvent, PromiEvent, PromiEventResult } from '../core-promievent';
import { fireError } from '../utils';
import { isObject, isArray } from 'util';
import { Method } from '.';
import { confirmTransaction } from './confirm-transaction';
import { Accounts } from '../eth/accounts';
import { RequestManager } from '../core-request-manager';

export function call(
  call: string,
  payload: any,
  accounts: Accounts,
  requestManager: RequestManager,
  outputFormatter: any,
  extraFormatters: any,
) {
  const isSendTx = call === 'eth_sendTransaction' || call === 'eth_sendRawTransaction';
  const defer = promiEvent(!isSendTx);
  asyncCall(isSendTx, defer, payload, accounts, requestManager, outputFormatter, extraFormatters);
  return defer.eventEmitter;
}

async function asyncCall(
  isSendTx: boolean,
  defer: PromiEventResult<any>,
  payload: any,
  accounts: Accounts,
  requestManager: RequestManager,
  outputFormatter: any,
  extraFormatters: any,
) {
  if (isSendTx && isObject(payload.params[0]) && typeof payload.params[0].gasPrice === 'undefined') {
    const getGasPrice = new Method({
      name: 'getGasPrice',
      call: 'eth_gasPrice',
      params: 0,
      requestManager,
    }).createFunction();

    const gasPrice = await getGasPrice();
    if (gasPrice) {
      payload.params[0].gasPrice = gasPrice;
    }
  }

  try {
    let result;

    if (payload.method === 'eth_sign') {
      result = await signTransaction(payload, accounts, requestManager);
    } else {
      if (payload.method === 'eth_sendTransaction') {
        result = await sendTransaction(payload, accounts, requestManager, outputFormatter);
      } else {
        result = await requestManager.send(payload);
      }

      if (result && outputFormatter) {
        if (isArray(result)) {
          result = result.map(res => (res ? outputFormatter(res) : res));
        } else {
          result = outputFormatter(result);
        }
      }

      if (result instanceof Error) {
        throw result;
      }

      if (payload.callback) {
        payload.callback(null, result);
      }
    }

    if (!isSendTx) {
      defer.resolve(result);
    } else {
      defer.eventEmitter.emit('transactionHash', result);
      confirmTransaction(defer, result, payload, requestManager, extraFormatters);
    }
  } catch (err) {
    if (err.error) {
      err = err.error;
    }
    fireError(err, defer.eventEmitter, defer.reject, payload.callback);
  }
}

async function sendTransaction(payload, accounts: Accounts, requestManager: RequestManager, outputFormatter: any) {
  var tx = payload.params[0];
  const account = getAccount(isObject(tx) ? tx.from : null, accounts);

  if (!account) {
    return await requestManager.send(payload);
  }

  const { from, ...fromlessTx } = tx;
  const signedTx = await accounts.signTransaction(fromlessTx, account.privateKey);
  const signedPayload = {
    ...payload,
    method: 'eth_sendRawTransaction',
    params: [signedTx.rawTransaction],
  };

  return await requestManager.send(signedPayload);
}

async function signTransaction(payload, accounts: Accounts, requestManager: RequestManager) {
  const data = payload.params[1];
  const account = getAccount(payload.params[0], accounts);

  if (!account) {
    return await requestManager.send(payload);
  }

  const sig = accounts.sign(data, account.privateKey);

  if (payload.callback) {
    payload.callback(null, sig.signature);
  }

  return sig.signature;
}

function getAccount(from, accounts: Accounts) {
  if (!accounts || !accounts.wallet || accounts.wallet.length === 0) {
    return;
  }

  if (isObject(from) && from.address && from.privateKey) {
    from = from.address;
  }

  return accounts.wallet.get(from);
}
