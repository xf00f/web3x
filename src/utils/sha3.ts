import Hash from '../eth-lib/hash';

/**
 * Hashes values to a sha3 hash using keccak 256
 *
 * To hash a HEX string the hex must have 0x in front.
 *
 * @method sha3
 * @return {String} the sha3 string
 */

export function sha3(value: string | Buffer): string {
  return Hash.keccak256(value);
}
