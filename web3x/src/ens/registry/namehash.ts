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

import uts46 from 'idna-uts46-hx';
import { sha3 } from '../../utils';

export function namehash(inputName) {
  // Reject empty names:
  let node = '';
  for (let i = 0; i < 32; i++) {
    node += '00';
  }

  const name = normalize(inputName);

  if (name) {
    const labels = name.split('.');

    for (let i = labels.length - 1; i >= 0; i--) {
      const labelSha = sha3(labels[i]).slice(2);
      node = sha3(new Buffer(node + labelSha, 'hex')).slice(2);
    }
  }

  return '0x' + node;
}

function normalize(name) {
  return name ? uts46.toAscii(name, { useStd3ASCII: true, transitional: false }) : name;
}
