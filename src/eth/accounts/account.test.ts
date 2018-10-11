import { Account } from './account';
import { checkAddressChecksum } from '../../utils';

describe('eth', function() {
  describe('account', function() {
    it('create account from private key', function() {
      const privateKey = '7a28b5ba57c53603b0b07b56bba752f7784bf506fa95edc395f5cf6c7514fe9d';
      const account = Account.fromPrivate(privateKey);

      expect(account.address).toBe('0x7448a2AC4305F13596649E5BA4A939dAD81C1770');
      expect(checkAddressChecksum(account.address)).toBe(true);
    });
  });
});
