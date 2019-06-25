/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

const package = require('./package.json');
const { writeFileSync, copyFileSync } = require('fs');
const replaceInFiles = require('replace-in-files');
const web3xPackage = require('web3x/package.json');

const { jest, scripts, devDependencies, ...pkg } = package;

pkg.dependencies.web3x = `^${web3xPackage.version}`;
writeFileSync('./dest/package.json', JSON.stringify(pkg, null, '  '));
copyFileSync('README.md', './dest/README.md');

pkg.name += '-es';
delete pkg.dependencies.web3x;
pkg.dependencies['web3x-es'] = `^${web3xPackage.version}`;
writeFileSync('./dest-es/package.json', JSON.stringify(pkg, null, '  '));
copyFileSync('README.md', './dest-es/README.md');
replaceInFiles({
  files: 'dest-es/**/*.{js,ts}',
  from: /(import .*?'web3x)(\/.*)/g,
  to: (_, $1, $2) => `${$1}-es${$2}`,
});
