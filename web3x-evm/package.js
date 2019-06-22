/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

const package = require('./package.json');
const { writeFileSync, copyFileSync } = require('fs');
const web3xPackage = require('web3x/package.json');

const { jest, scripts, devDependencies, ...pkg } = package;
pkg.dependencies.web3x = `^${web3xPackage.version}`;
writeFileSync('./dest/package.json', JSON.stringify(pkg, null, '  '));
copyFileSync('README.md', './dest/README.md');
