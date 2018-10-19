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

import { isObject, isArray, isString, isFunction } from 'util';
import { PromiEvent } from '../promievent';

/**
 * Fires an error in an event emitter and callback and returns the eventemitter
 *
 * @method fireError
 * @param {Object} error a string, a error, or an object with {message, data}
 * @param {Object} emitter
 * @param {Function} reject
 * @param {Function} callback
 * @return {Object} the emitter
 */
export function fireError(error, emitter: PromiEvent<any>, reject?, callback?) {
  // add data if given
  if (isObject(error) && !(error instanceof Error) && error.data) {
    if (isObject(error.data) || isArray(error.data)) {
      error.data = JSON.stringify(error.data, null, 2);
    }

    error = error.message + '\n' + error.data;
  }

  if (isString(error)) {
    error = new Error(error);
  }

  if (isFunction(callback)) {
    callback(error);
  }

  if (isFunction(reject)) {
    // suppress uncatched error if an error listener is present
    // OR suppress uncatched error if an callback listener is present
    if ((emitter && (isFunction(emitter.listeners) && emitter.listeners('error').length)) || isFunction(callback)) {
      emitter.catch(function() {});
    }
    // reject later, to be able to return emitter
    setTimeout(function() {
      reject(error);
    }, 1);
  }

  if (emitter && isFunction(emitter.emit)) {
    // emit later, to be able to return emitter
    setTimeout(function() {
      emitter.emit('error', error);
      emitter.removeAllListeners();
    }, 1);
  }

  return emitter;
}
