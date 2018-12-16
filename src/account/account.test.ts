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
import { checkAddressChecksum, bufferToHex } from '../utils';

describe('accounts', function() {
  describe('account', function() {
    it('create account from private key', function() {
      const privateKey = Buffer.from('7a28b5ba57c53603b0b07b56bba752f7784bf506fa95edc395f5cf6c7514fe9d', 'hex');
      const account = Account.fromPrivate(privateKey);

      expect(account.address).toBe('0x008AeEda4D805471dF9b2A5B0f38A0C3bCBA786b');
      expect(checkAddressChecksum(account.address)).toBe(true);
    });

    it('should fail with 0 gas', async () => {
      const mockEth: any = null;
      const localAccount = Account.create();
      await expect(
        localAccount.sendTransaction(
          { chainId: 1, nonce: 0, gasPrice: 1, to: localAccount.address, value: 1, gas: 0 },
          mockEth,
        ),
      ).rejects.toThrowError('"gas" is missing');
    });
  });

  it('should generate derived ethereum account', async () => {
    const mnemonic =
      'air embark traffic hip airport patch airport sure prefer prize enable bronze dizzy any jump road version claw idea ugly fragile release uncover reason';
    const path = `m/44'/60'/0'/0/0`;
    const account = Account.createFromMnemonicAndPath(mnemonic, path);
    expect(account.address).toBe('0xCFaE51EE51d31a6Be641D79aB982a22c1604b5Ad');
    expect(bufferToHex(account.privateKey)).toBe('0xbefa3c16c697f6171f2ede1b49ac94ed420b006c25b9b797a86bc5a3bca1c57b');
  });
});
