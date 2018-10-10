/**
 * Should be called to pad string to expected length
 *
 * @method leftPad
 * @param {String} string to be padded
 * @param {Number} chars that result string should have
 * @param {String} sign, by default 0
 * @returns {String} right aligned string
 */
export var leftPad = function(string: string, chars: number, sign = '0') {
  var hasPrefix = /^0x/i.test(string) || typeof string === 'number';
  string = string.toString().replace(/^0x/i, '');

  var padding = chars - string.length + 1 >= 0 ? chars - string.length + 1 : 0;

  return (hasPrefix ? '0x' : '') + new Array(padding).join(sign ? sign : '0') + string;
};

/**
 * Should be called to pad string to expected length
 *
 * @method rightPad
 * @param {String} string to be padded
 * @param {Number} chars that result string should have
 * @param {String} sign, by default 0
 * @returns {String} right aligned string
 */
export var rightPad = function(string: string, chars: number, sign = '0') {
  var hasPrefix = /^0x/i.test(string) || typeof string === 'number';
  string = string.toString().replace(/^0x/i, '');

  var padding = chars - string.length + 1 >= 0 ? chars - string.length + 1 : 0;

  return (hasPrefix ? '0x' : '') + string + new Array(padding).join(sign ? sign : '0');
};
