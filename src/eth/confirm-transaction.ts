/*
  This file is part of web3x.

  web3x is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  web3x is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License
  along with web3x.  If not, see <http://www.gnu.org/licenses/>.
*/

import { fireError } from '../utils';
import { isObject } from 'util';
import { Eth } from '.';
import { Subscriptions } from '../subscriptions';
import { outputBlockFormatter } from '../formatters';

const TIMEOUTBLOCK = 50;
const POLLINGTIMEOUT = 15 * TIMEOUTBLOCK; // ~average block time (seconds) * TIMEOUTBLOCK
const CONFIRMATIONBLOCKS = 24;

class UnminedError extends Error {}

export async function confirmTransaction(defer, result, payload, eth: Eth, extraFormatters?) {
  let promiseResolved = false;
  let canUnsubscribe = true;
  let timeoutCount = 0;
  let confirmationCount = 0;
  let intervalId: any = null;
  let receiptJSON = '';
  let gasProvided = isObject(payload.params[0]) && payload.params[0].gas ? payload.params[0].gas : null;
  let isContractDeployment =
    isObject(payload.params[0]) && payload.params[0].data && payload.params[0].from && !payload.params[0].to;

  // fire "receipt" and confirmation events and resolve after
  var checkConfirmation = async function(existingReceipt, isPolling, err?, blockHeader?, sub?) {
    if (err) {
      sub.unsubscribe();
      promiseResolved = true;
      fireError(
        { message: 'Failed to subscribe to new newBlockHeaders to confirm the transaction receipts.', data: err },
        defer.eventEmitter,
        defer.reject,
      );
      return;
    }

    // create fake unsubscribe
    if (!sub) {
      sub = {
        unsubscribe: function() {
          clearInterval(intervalId);
        },
      };
    }

    let receipt = existingReceipt;

    if (!receipt) {
      try {
        receipt = await eth.getTransactionReceipt(result);
      } catch (err) {
        sub.unsubscribe();
        promiseResolved = true;
        fireError({ message: 'Failed to check for transaction receipt:', data: err }, defer.eventEmitter, defer.reject);
      }
    }

    try {
      // if CONFIRMATION listener exists check for confirmations, by setting canUnsubscribe = false
      {
        if (!receipt || !receipt.blockHash) {
          throw new UnminedError('Receipt missing or blockHash null');
        }

        // apply extra formatters
        if (extraFormatters && extraFormatters.receiptFormatter) {
          receipt = extraFormatters.receiptFormatter(receipt);
        }

        // check if confirmation listener exists
        if (defer.eventEmitter.listeners('confirmation').length > 0) {
          defer.eventEmitter.emit('confirmation', confirmationCount, receipt);

          canUnsubscribe = false;
          confirmationCount++;

          if (confirmationCount === CONFIRMATIONBLOCKS + 1) {
            // add 1 so we account for conf 0
            sub.unsubscribe();
            defer.eventEmitter.removeAllListeners();
          }
        }
      }

      // CHECK for CONTRACT DEPLOYMENT
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

        const code = await eth.getCode(receipt.contractAddress);
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

      // CHECK for normal tx check for receipt only
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
    } catch (err) {
      if (!(err instanceof UnminedError)) {
        fireError(err, defer.eventEmitter, defer.reject);
        return;
      }
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
    }
  };

  // start watching for confirmation depending on the support features of the provider
  const startWatching = (existingReceipt?) => {
    // if provider allows PUB/SUB
    if (eth.requestManager.supportsSubscriptions()) {
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
        requestManager: eth.requestManager,
      }).createFunction();
      subscribe('newBlockHeaders', checkConfirmation.bind(null, existingReceipt, false));
    } else {
      intervalId = setInterval(checkConfirmation.bind(null, existingReceipt, true), 1000);
    }
  };

  // first check if we already have a confirmed transaction
  try {
    const receipt = await eth.getTransactionReceipt(result);
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
