import Hash from '../eth-lib/hash';
import { isHexStrict, hexToBytes } from '.';

export function hashMessage(data) {
  var message = isHexStrict(data) ? hexToBytes(data) : data;
  var messageBuffer = Buffer.from(message);
  var preamble = '\x19Ethereum Signed Message:\n' + message.length;
  var preambleBuffer = Buffer.from(preamble);
  var ethMessage = Buffer.concat([preambleBuffer, messageBuffer]);
  return Hash.keccak256s(ethMessage);
}
