import { isHexStrict, isHex } from './hex';

/**
 * Convert a byte array to a hex string
 *
 * Note: Implementation from crypto-js
 *
 * @method bytesToHex
 * @param {Array} bytes
 * @return {String} the hex string
 */
export var bytesToHex = function(bytes: number[], prefix: boolean = true) {
  for (var hex: any[] = [], i = 0; i < bytes.length; i++) {
    /* jshint ignore:start */
    hex.push((bytes[i] >>> 4).toString(16));
    hex.push((bytes[i] & 0xf).toString(16));
    /* jshint ignore:end */
  }
  return prefix ? '0x' + hex.join('') : hex.join('');
};

/**
 * Convert a hex string to a byte array
 *
 * Note: Implementation from crypto-js
 *
 * @method hexToBytes
 * @param {string} hex
 * @return {Array} the byte array
 */
export var hexToBytes = function(hex: string, prefix: boolean = true): number[] {
  if ((prefix && !isHexStrict(hex)) || !isHex(hex)) {
    throw new Error('Given value "' + hex + '" is not a valid hex string.');
  }

  hex = hex.replace(/^0x/i, '');

  for (var bytes: any[] = [], c = 0; c < hex.length; c += 2) bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
};
