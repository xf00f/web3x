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

import { hexToBytes, isHexStrict } from '.';
import Hash from '../eth-lib/hash';

export function hashMessage(data) {
  const message = isHexStrict(data) ? hexToBytes(data) : data;
  const messageBuffer = Buffer.from(message);
  const preamble = '\x19Ethereum Signed Message:\n' + message.length;
  const preambleBuffer = Buffer.from(preamble);
  const ethMessage = Buffer.concat([preambleBuffer, messageBuffer]);
  return Hash.keccak256s(ethMessage);
}
