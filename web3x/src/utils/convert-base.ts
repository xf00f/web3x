import JSBI from 'jsbi';

const symbols = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~`!@#$%^&*()-_=+[{]}\\|;:\'",<.>/?¿¡';

export function convertBase(src: string, fromBase: number, toBase: number) {
  if (fromBase > symbols.length || toBase > symbols.length) {
    throw new Error(`Cannot convert ${src} to base ${toBase}, greater than symbol table length.`);
  }

  const fromBaseBn = JSBI.BigInt(fromBase);
  const toBaseBn = JSBI.BigInt(toBase);

  // First convert to base 10.
  let val = JSBI.BigInt(0);
  for (let i = 0; i < src.length; i++) {
    val = JSBI.add(JSBI.multiply(val, fromBaseBn), JSBI.BigInt(symbols.indexOf(src.charAt(i))));
  }

  // Then convert to any base.
  let newValue = '';
  while (JSBI.greaterThan(val, JSBI.BigInt(0))) {
    const r = JSBI.remainder(val, toBaseBn);
    newValue = symbols[Number(r.toString())] + newValue;
    val = JSBI.divide(JSBI.subtract(val, r), toBaseBn);
  }

  return newValue || '0';
}
