import uts46 from 'idna-uts46-hx';
import { sha3 } from '../../utils';

export function namehash(inputName) {
  // Reject empty names:
  var node = '';
  for (var i = 0; i < 32; i++) {
    node += '00';
  }

  const name = normalize(inputName);

  if (name) {
    var labels = name.split('.');

    for (var i = labels.length - 1; i >= 0; i--) {
      var labelSha = sha3(labels[i]).slice(2);
      node = sha3(new Buffer(node + labelSha, 'hex')).slice(2);
    }
  }

  return '0x' + node;
}

function normalize(name) {
  return name ? uts46.toAscii(name, { useStd3ASCII: true, transitional: false }) : name;
}
