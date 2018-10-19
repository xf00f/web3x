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

import { Account } from './account';
import { checkAddressChecksum } from '../utils';

describe('accounts', function() {
  describe('account', function() {
    it('create account from private key', function() {
      const mockEth: any = null;
      const privateKey = '7a28b5ba57c53603b0b07b56bba752f7784bf506fa95edc395f5cf6c7514fe9d';
      const account = Account.fromPrivate(mockEth, privateKey);

      expect(account.address).toBe('0x7448a2AC4305F13596649E5BA4A939dAD81C1770');
      expect(checkAddressChecksum(account.address)).toBe(true);
    });
  });
});
