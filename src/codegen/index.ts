#!/usr/bin/env node
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

import fs from 'fs';
import ts from 'typescript';
import { ContractAbi, AbiInput, AbiDefinition } from '../contract';
import got from 'got';
import mkdirp from 'mkdirp';

const printer = ts.createPrinter({
  newLine: ts.NewLineKind.LineFeed,
});

interface Config {
  es6Modules?: boolean;
  outputPath?: string;
  contracts: { [name: string]: string };
}

function getTsTypeFromSolidityType(input: AbiInput, returnValue: boolean) {
  const { type } = input;

  if (type.match(/u?int\d+/) || type.match(/u?fixed[0-9x]+/)) {
    return !returnValue
      ? ts.createUnionTypeNode([
          ts.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
          ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
          ts.createTypeReferenceNode(ts.createIdentifier('BN'), undefined),
        ])
      : ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
  }

  if (type === 'bool') {
    return ts.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
  }

  if (type === 'tuple') {
    return ts.createTypeLiteralNode(
      input.components!.map(prop =>
        ts.createPropertySignature(undefined, prop.name, undefined, getTsTypeFromSolidityType(prop, true), undefined),
      ),
    );
  }

  return ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
}

function makeParameter(input: AbiInput, index: number) {
  return ts.createParameter(
    undefined,
    undefined,
    undefined,
    input.name || `a${index}`,
    undefined,
    getTsTypeFromSolidityType(input, false),
  );
}

function getOutputType(definition: AbiDefinition) {
  if (definition.stateMutability === 'view') {
    if (definition.outputs && definition.outputs.length) {
      return getTsTypeFromSolidityType(definition.outputs[0], true);
    } else {
      return undefined;
    }
  } else {
    return ts.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword);
  }
}

function makeMethod(definition: AbiDefinition) {
  return ts.createMethodSignature(
    undefined,
    definition.inputs!.map(makeParameter),
    getOutputType(definition),
    definition.name!,
    undefined,
  );
}

function makeEvent(definition: AbiDefinition) {
  const props = ts.createTypeLiteralNode(
    definition.inputs!.map(input =>
      ts.createPropertySignature(undefined, input.name, undefined, getTsTypeFromSolidityType(input, true), undefined),
    ),
  );

  return ts.createPropertySignature(undefined, definition.name!, undefined, props, undefined);
}

function makeMethodsInterface(name: ts.Identifier, abi: ContractAbi): ts.InterfaceDeclaration {
  const methods = abi.filter(def => def.type === 'function').map(makeMethod);
  return ts.createInterfaceDeclaration(undefined, undefined, name, undefined, undefined, methods);
}

function makeEventsInterface(name: ts.Identifier, abi: ContractAbi): ts.InterfaceDeclaration {
  const events = abi.filter(def => def.type === 'event').map(makeEvent);
  return ts.createInterfaceDeclaration(undefined, undefined, name, undefined, undefined, events);
}

function makeImports(name: string, es6Modules: boolean) {
  return [
    ts.createImportDeclaration(
      undefined,
      undefined,
      ts.createImportClause(ts.createIdentifier('BN'), undefined),
      ts.createRegularExpressionLiteral("'bn.js'"),
    ),
    ts.createImportDeclaration(
      undefined,
      undefined,
      ts.createImportClause(
        undefined,
        ts.createNamedImports([
          ts.createImportSpecifier(undefined, ts.createIdentifier('Contract')),
          ts.createImportSpecifier(undefined, ts.createIdentifier('ContractOptions')),
          ts.createImportSpecifier(undefined, ts.createIdentifier('ContractAbi')),
        ]),
      ),
      ts.createRegularExpressionLiteral(es6Modules ? "'web3x-es/contract'" : "'web3x/contract'"),
    ),
    ts.createImportDeclaration(
      undefined,
      undefined,
      ts.createImportClause(
        undefined,
        ts.createNamedImports([ts.createImportSpecifier(undefined, ts.createIdentifier('Eth'))]),
      ),
      ts.createRegularExpressionLiteral(es6Modules ? "'web3x-es/eth'" : "'web3x/eth'"),
    ),
    ts.createImportDeclaration(
      undefined,
      undefined,
      ts.createImportClause(ts.createIdentifier('abi'), undefined),
      ts.createRegularExpressionLiteral(`'./${name}.abi.json'`),
    ),
  ];
}

function makeContract(name: string, definitionInterfaceName: ts.Identifier) {
  const ctor = ts.createConstructor(
    undefined,
    undefined,
    [
      ts.createParameter(
        undefined,
        undefined,
        undefined,
        'eth',
        undefined,
        ts.createTypeReferenceNode('Eth', undefined),
      ),
      ts.createParameter(
        undefined,
        undefined,
        undefined,
        'address',
        ts.createToken(ts.SyntaxKind.QuestionToken),
        ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
      ),
      ts.createParameter(
        undefined,
        undefined,
        undefined,
        'options',
        ts.createToken(ts.SyntaxKind.QuestionToken),
        ts.createTypeReferenceNode('ContractOptions', undefined),
      ),
    ],
    ts.createBlock(
      [
        ts.createStatement(
          ts.createCall(ts.createSuper(), undefined, [
            ts.createIdentifier('eth'),
            ts.createAsExpression(ts.createIdentifier('abi'), ts.createTypeReferenceNode('ContractAbi', undefined)),
            ts.createIdentifier('address'),
            ts.createIdentifier('options'),
          ]),
        ),
      ],
      true,
    ),
  );

  return ts.createClassDeclaration(
    undefined,
    [ts.createToken(ts.SyntaxKind.ExportKeyword)],
    name,
    undefined,
    [
      ts.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
        ts.createExpressionWithTypeArguments(
          [ts.createTypeReferenceNode(definitionInterfaceName, undefined)],
          ts.createRegularExpressionLiteral('Contract'),
        ),
      ]),
    ],
    [ctor],
  );
}

function makeFile(name: string, abi: ContractAbi, es6Modules: boolean) {
  const definitionInterfaceName = ts.createIdentifier(`${name}Definition`);
  const methodsInterfaceName = ts.createIdentifier(`${name}Methods`);
  const eventsInterfaceName = ts.createIdentifier(`${name}Events`);

  const methodsInterface = makeMethodsInterface(methodsInterfaceName, abi);
  const eventsInterface = makeEventsInterface(eventsInterfaceName, abi);

  const props = [
    ts.createPropertySignature(
      undefined,
      'methods',
      undefined,
      ts.createTypeReferenceNode(methodsInterfaceName, undefined),
      undefined,
    ),
    ts.createPropertySignature(
      undefined,
      'events',
      undefined,
      ts.createTypeReferenceNode(eventsInterfaceName, undefined),
      undefined,
    ),
  ];

  const definitionInterface = ts.createInterfaceDeclaration(
    undefined,
    [ts.createToken(ts.SyntaxKind.ExportKeyword)],
    definitionInterfaceName,
    undefined,
    undefined,
    props,
  );

  const imports = makeImports(name, es6Modules);

  const contract = makeContract(name, definitionInterfaceName);

  return ts.createNodeArray([...imports, methodsInterface, eventsInterface, definitionInterface, contract]);
}

async function getContractAbi(abiLocation: string): Promise<ContractAbi> {
  if (abiLocation.match(/^http/)) {
    const response = await got(abiLocation, { json: true });
    return response.body;
  } else {
    return JSON.parse(fs.readFileSync(abiLocation).toString());
  }
}

async function generateInterface(outputPath: string, name: string, abiLocation: string, es6Modules: boolean) {
  const interfaceOutputFile = `${outputPath}/${name}.ts`;
  const abiOutputFile = `${outputPath}/${name}.abi.json`;
  const abi = await getContractAbi(abiLocation);

  const resultFile = ts.createSourceFile('', '', ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
  resultFile.statements = makeFile(name, abi, es6Modules);

  fs.writeFileSync(interfaceOutputFile, printer.printFile(resultFile));
  fs.writeFileSync(abiOutputFile, JSON.stringify(abi, undefined, 2));
}

async function main() {
  const configFile = process.argv[2] || 'contracts.json';
  const config = JSON.parse(fs.readFileSync(configFile).toString()) as Config;
  const { outputPath = 'contracts' } = config;
  let es6Modules = false;

  try {
    const pkg = JSON.parse(fs.readFileSync('package.json').toString());
    es6Modules = !!pkg.dependencies['web3x-es'] || !!pkg.devDependencies['web3x-es'];
  } catch (err) {}

  mkdirp.sync(outputPath);

  await Promise.all(
    Object.entries(config.contracts).map(entry => generateInterface(outputPath, entry[0], entry[1], es6Modules)),
  );
}

main().catch(console.error);
