const package = require('./package.json');
const { writeFileSync, copyFileSync } = require('fs');

const { jest, scripts, devDependencies, ...pkg } = package;
writeFileSync('./dest/package.json', JSON.stringify(pkg, null, '  '));
writeFileSync('./dest-es/package.json', JSON.stringify({ ...pkg, name: `${pkg.name}-es` }, null, '  '));
copyFileSync('README.md', './dest/README.md');
copyFileSync('README.md', './dest-es/README.md');
