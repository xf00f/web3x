import { fireError } from '../utils';
import { resolvedPromiEvent } from '../core-promievent';
import { isObject, isFunction } from 'util';
import { Method } from '.';
import { Subscriptions } from '../core-subscriptions';
import { RequestManager } from '../core-request-manager';
import {
  outputTransactionReceiptFormatter,
  inputAddressFormatter,
  inputDefaultBlockNumberFormatter,
  outputBlockFormatter,
} from '../core-helpers/formatters';

const TIMEOUTBLOCK = 50;
const POLLINGTIMEOUT = 15 * TIMEOUTBLOCK; // ~average block time (seconds) * TIMEOUTBLOCK
const CONFIRMATIONBLOCKS = 24;

export async function confirmTransaction(defer, result, payload, requestManager: RequestManager, extraFormatters) {
  let promiseResolved = false;
  let canUnsubscribe = true;
  let timeoutCount = 0;
  let confirmationCount = 0;
  let intervalId: any = null;
  let receiptJSON = '';
  let gasProvided = isObject(payload.params[0]) && payload.params[0].gas ? payload.params[0].gas : null;
  let isContractDeployment =
    isObject(payload.params[0]) && payload.params[0].data && payload.params[0].from && !payload.params[0].to;

  const getTransactionReceipt = new Method({
    name: 'getTransactionReceipt',
    call: 'eth_getTransactionReceipt',
    params: 1,
    inputFormatter: [null],
    outputFormatter: outputTransactionReceiptFormatter,
    requestManager,
  }).createFunction();

  const getCode = new Method({
    name: 'getCode',
    call: 'eth_getCode',
    params: 2,
    inputFormatter: [inputAddressFormatter, inputDefaultBlockNumberFormatter],
    requestManager,
  }).createFunction();

  const subscribe = new Subscriptions({
    name: 'subscribe',
    type: 'eth',
    subscriptions: {
      newBlockHeaders: {
        subscriptionName: 'newHeads', // replace subscription with this name
        params: 0,
        outputFormatter: outputBlockFormatter,
      },
    },
    requestManager,
  }).createFunction();

  // fire "receipt" and confirmation events and resolve after
  var checkConfirmation = function(existingReceipt, isPolling, err?, blockHeader?, sub?) {
    if (!err) {
      // create fake unsubscribe
      if (!sub) {
        sub = {
          unsubscribe: function() {
            clearInterval(intervalId);
          },
        };
      }
      // if we have a valid receipt we don't need to send a request
      return (
        (existingReceipt ? resolvedPromiEvent(existingReceipt) : getTransactionReceipt(result))
          // catch error from requesting receipt
          .catch((err => {
            sub.unsubscribe();
            promiseResolved = true;
            fireError(
              { message: 'Failed to check for transaction receipt:', data: err },
              defer.eventEmitter,
              defer.reject,
            );
          }) as any)
          // if CONFIRMATION listener exists check for confirmations, by setting canUnsubscribe = false
          .then(function(receipt) {
            if (!receipt || !receipt.blockHash) {
              throw new Error('Receipt missing or blockHash null');
            }

            // apply extra formatters
            if (extraFormatters && extraFormatters.receiptFormatter) {
              receipt = extraFormatters.receiptFormatter(receipt);
            }

            // check if confirmation listener exists
            if (defer.eventEmitter.listeners('confirmation').length > 0) {
              // If there was an immediately retrieved receipt, it's already
              // been confirmed by the direct call to checkConfirmation needed
              // for parity instant-seal
              if (existingReceipt === undefined || confirmationCount !== 0) {
                defer.eventEmitter.emit('confirmation', confirmationCount, receipt);
              }

              canUnsubscribe = false;
              confirmationCount++;

              if (confirmationCount === CONFIRMATIONBLOCKS + 1) {
                // add 1 so we account for conf 0
                sub.unsubscribe();
                defer.eventEmitter.removeAllListeners();
              }
            }

            return receipt;
          })
          // CHECK for CONTRACT DEPLOYMENT
          .then(async receipt => {
            if (isContractDeployment && !promiseResolved) {
              if (!receipt.contractAddress) {
                if (canUnsubscribe) {
                  sub.unsubscribe();
                  promiseResolved = true;
                }

                fireError(
                  new Error("The transaction receipt didn't contain a contract address."),
                  defer.eventEmitter,
                  defer.reject,
                );
                return;
              }

              const code = await getCode(receipt.contractAddress);
              if (!code) {
                return;
              }

              if (code.length > 2) {
                defer.eventEmitter.emit('receipt', receipt);

                // if contract, return instance instead of receipt
                if (extraFormatters && extraFormatters.contractDeployFormatter) {
                  defer.resolve(extraFormatters.contractDeployFormatter(receipt));
                } else {
                  defer.resolve(receipt);
                }

                // need to remove listeners, as they aren't removed automatically when succesfull
                if (canUnsubscribe) {
                  defer.eventEmitter.removeAllListeners();
                }
              } else {
                fireError(
                  new Error("The contract code couldn't be stored, please check your gas limit."),
                  defer.eventEmitter,
                  defer.reject,
                );
              }

              if (canUnsubscribe) {
                sub.unsubscribe();
              }
              promiseResolved = true;
            }

            return receipt;
          })
          // CHECK for normal tx check for receipt only
          .then(function(receipt) {
            if (!isContractDeployment && !promiseResolved) {
              if (
                !receipt.outOfGas &&
                (!gasProvided || gasProvided !== receipt.gasUsed) &&
                (receipt.status === true || receipt.status === '0x1' || typeof receipt.status === 'undefined')
              ) {
                defer.eventEmitter.emit('receipt', receipt);
                defer.resolve(receipt);

                // need to remove listeners, as they aren't removed automatically when succesfull
                if (canUnsubscribe) {
                  defer.eventEmitter.removeAllListeners();
                }
              } else {
                receiptJSON = JSON.stringify(receipt, null, 2);
                if (receipt.status === false || receipt.status === '0x0') {
                  fireError(
                    new Error('Transaction has been reverted by the EVM:\n' + receiptJSON),
                    defer.eventEmitter,
                    defer.reject,
                  );
                } else {
                  fireError(
                    new Error('Transaction ran out of gas. Please provide more gas:\n' + receiptJSON),
                    defer.eventEmitter,
                    defer.reject,
                  );
                }
              }

              if (canUnsubscribe) {
                sub.unsubscribe();
              }
              promiseResolved = true;
            }
          })
          // time out the transaction if not mined after 50 blocks
          .catch(function(err) {
            console.log(err);
            timeoutCount++;

            // check to see if we are http polling
            if (!!isPolling) {
              // polling timeout is different than TIMEOUTBLOCK blocks since we are triggering every second
              if (timeoutCount - 1 >= POLLINGTIMEOUT) {
                sub.unsubscribe();
                promiseResolved = true;
                fireError(
                  new Error(
                    'Transaction was not mined within' +
                      POLLINGTIMEOUT +
                      ' seconds, please make sure your transaction was properly sent. Be aware that it might still be mined!',
                  ),
                  defer.eventEmitter,
                  defer.reject,
                );
              }
            } else {
              if (timeoutCount - 1 >= TIMEOUTBLOCK) {
                sub.unsubscribe();
                promiseResolved = true;
                fireError(
                  new Error(
                    'Transaction was not mined within 50 blocks, please make sure your transaction was properly sent. Be aware that it might still be mined!',
                  ),
                  defer.eventEmitter,
                  defer.reject,
                );
              }
            }
          })
      );
    } else {
      sub.unsubscribe();
      promiseResolved = true;
      fireError(
        { message: 'Failed to subscribe to new newBlockHeaders to confirm the transaction receipts.', data: err },
        defer.eventEmitter,
        defer.reject,
      );
    }
  };

  // start watching for confirmation depending on the support features of the provider
  const startWatching = (existingReceipt?) => {
    // if provider allows PUB/SUB
    if (isFunction(requestManager.provider.on)) {
      subscribe('newBlockHeaders', checkConfirmation.bind(null, existingReceipt, false));
    } else {
      intervalId = setInterval(checkConfirmation.bind(null, existingReceipt, true), 1000);
    }
  };

  // first check if we already have a confirmed transaction
  try {
    const receipt = await getTransactionReceipt(result);
    if (receipt && receipt.blockHash) {
      if (defer.eventEmitter.listeners('confirmation').length > 0) {
        // We must keep on watching for new Blocks, if a confirmation listener is present
        startWatching(receipt);
      }
      checkConfirmation(receipt, false);
    } else if (!promiseResolved) {
      startWatching();
    }
  } catch (_) {
    if (!promiseResolved) startWatching();
  }
}
