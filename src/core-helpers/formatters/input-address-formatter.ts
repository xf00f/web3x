import { Iban } from '../../eth/iban';
import { isAddress } from '../../utils';

export function inputAddressFormatter(address) {
  const iban = new Iban(address);
  if (iban.isValid() && iban.isDirect()) {
    return iban.toAddress().toLowerCase();
  } else if (isAddress(address)) {
    return '0x' + address.toLowerCase().replace('0x', '');
  }
  throw new Error(
    'Provided address "' +
      address +
      '" is invalid, the capitalization checksum test failed, or its an indrect IBAN address which can\'t be converted.'
  );
}
