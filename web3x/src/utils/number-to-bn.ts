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

import BN from 'bn.js';

function stripHexPrefix(str: string) {
  return str.replace('0x', '');
}

export function numberToBN(arg) {
  if (typeof arg === 'string' || typeof arg === 'number') {
    let multiplier = new BN(1); // eslint-disable-line
    const formattedString = String(arg)
      .toLowerCase()
      .trim();
    const isHexPrefixed = formattedString.substr(0, 2) === '0x' || formattedString.substr(0, 3) === '-0x';
    let stringArg = stripHexPrefix(formattedString); // eslint-disable-line
    if (stringArg.substr(0, 1) === '-') {
      stringArg = stripHexPrefix(stringArg.slice(1));
      multiplier = new BN(-1, 10);
    }
    stringArg = stringArg === '' ? '0' : stringArg;

    if (
      (!stringArg.match(/^-?[0-9]+$/) && stringArg.match(/^[0-9A-Fa-f]+$/)) ||
      stringArg.match(/^[a-fA-F]+$/) ||
      (isHexPrefixed === true && stringArg.match(/^[0-9A-Fa-f]+$/))
    ) {
      return new BN(stringArg, 16).mul(multiplier);
    }

    if ((stringArg.match(/^-?[0-9]+$/) || stringArg === '') && isHexPrefixed === false) {
      return new BN(stringArg, 10).mul(multiplier);
    }
  } else if (typeof arg === 'object' && arg.toString && (!arg.pop && !arg.push)) {
    if (arg.toString(10).match(/^-?[0-9]+$/) && (arg.mul || arg.dividedToIntegerBy)) {
      return new BN(arg.toString(10), 10);
    }
  }

  throw new Error(
    '[number-to-bn] while converting number ' +
      JSON.stringify(arg) +
      ' to BN.js instance, error: invalid number value. Value must be an integer, hex string, BN or BigNumber instance. Note, decimals are not supported.',
  );
}
