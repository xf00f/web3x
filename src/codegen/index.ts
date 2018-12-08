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
  web3xPath?: string;
  outputPath?: string;
  contracts: { [name: string]: string };
}

function makeImports(name: string, web3xPath: string) {
  return [
    ts.createImportDeclaration(
      undefined,
      undefined,
      ts.createImportClause(ts.createIdentifier('BN'), undefined),
      ts.createLiteral('bn.js'),
    ),
    ts.createImportDeclaration(
      undefined,
      undefined,
      ts.createImportClause(
        undefined,
        ts.createNamedImports([
          ts.createImportSpecifier(undefined, ts.createIdentifier('EventLog')),
          ts.createImportSpecifier(undefined, ts.createIdentifier('TransactionReceipt')),
        ]),
      ),
      ts.createLiteral(`${web3xPath}/formatters`),
    ),
    ts.createImportDeclaration(
      undefined,
      undefined,
      ts.createImportClause(
        undefined,
        ts.createNamedImports([
          ts.createImportSpecifier(undefined, ts.createIdentifier('Contract')),
          ts.createImportSpecifier(undefined, ts.createIdentifier('ContractOptions')),
          ts.createImportSpecifier(undefined, ts.createIdentifier('TxCall')),
          ts.createImportSpecifier(undefined, ts.createIdentifier('TxSend')),
          ts.createImportSpecifier(undefined, ts.createIdentifier('EventSubscriptionFactory')),
        ]),
      ),
      ts.createLiteral(`${web3xPath}/contract`),
    ),
    ts.createImportDeclaration(
      undefined,
      undefined,
      ts.createImportClause(
        undefined,
        ts.createNamedImports([ts.createImportSpecifier(undefined, ts.createIdentifier('Eth'))]),
      ),
      ts.createLiteral(`${web3xPath}/eth`),
    ),
    ts.createImportDeclaration(
      undefined,
      undefined,
      ts.createImportClause(ts.createIdentifier('abi'), undefined),
      ts.createLiteral(`./${name}Abi`),
    ),
  ];
}

function makeEventType(definition: AbiDefinition) {
  const props = ts.createTypeLiteralNode(
    definition.inputs!.map(input =>
      ts.createPropertySignature(undefined, input.name, undefined, getTsTypeFromSolidityType(input, true), undefined),
    ),
  );

  return ts.createTypeAliasDeclaration(
    undefined,
    [ts.createToken(ts.SyntaxKind.ExportKeyword)],
    `${definition.name}Event`,
    undefined,
    props,
  );
}

function makeEventTypes(abi: ContractAbi) {
  return abi.filter(def => def.type === 'event').map(makeEventType);
}

function makeEventLogInterface(definition: AbiDefinition) {
  const eventName = `${definition.name!}Event`;
  return ts.createInterfaceDeclaration(
    undefined,
    [ts.createToken(ts.SyntaxKind.ExportKeyword)],
    `${eventName}Log`,
    undefined,
    [
      ts.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
        ts.createExpressionWithTypeArguments(
          [
            ts.createTypeReferenceNode(eventName, undefined),
            ts.createLiteralTypeNode(ts.createLiteral(definition.name!)),
          ],
          ts.createRegularExpressionLiteral('EventLog'),
        ),
      ]),
    ],
    [],
  );
}

function makeEventLogInterfaces(abi: ContractAbi) {
  return abi.filter(def => def.type === 'event').map(makeEventLogInterface);
}

function makeEventsInterface(name: string, abi: ContractAbi) {
  const events = abi.filter(def => def.type === 'event').map(event => event.name!);
  return ts.createInterfaceDeclaration(
    undefined,
    undefined,
    `${name}Events`,
    undefined,
    undefined,
    events.map(eventName =>
      ts.createPropertySignature(
        undefined,
        eventName,
        undefined,
        ts.createTypeReferenceNode(`EventSubscriptionFactory`, [
          ts.createTypeReferenceNode(`${eventName}EventLog`, undefined),
        ]),
        undefined,
      ),
    ),
  );
}

function makeEventLogsInterface(name: string, abi: ContractAbi) {
  const events = abi.filter(def => def.type === 'event').map(event => event.name!);
  return ts.createInterfaceDeclaration(
    undefined,
    undefined,
    `${name}EventLogs`,
    undefined,
    undefined,
    events.map(eventName =>
      ts.createPropertySignature(
        undefined,
        eventName,
        undefined,
        ts.createTypeReferenceNode(`${eventName}EventLog`, undefined),
        undefined,
      ),
    ),
  );
}

function makeTxEventLogsInterface(name: string, abi: ContractAbi) {
  const events = abi.filter(def => def.type === 'event').map(event => event.name!);
  return ts.createInterfaceDeclaration(
    undefined,
    undefined,
    `${name}TxEventLogs`,
    undefined,
    undefined,
    events.map(eventName =>
      ts.createPropertySignature(
        undefined,
        eventName,
        undefined,
        ts.createArrayTypeNode(ts.createTypeReferenceNode(`${eventName}EventLog`, undefined)),
        undefined,
      ),
    ),
  );
}

function makeTransactionReceiptInterface(name: string) {
  return ts.createInterfaceDeclaration(
    undefined,
    [ts.createToken(ts.SyntaxKind.ExportKeyword)],
    `${name}TransactionReceipt`,
    undefined,
    [
      ts.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
        ts.createExpressionWithTypeArguments(
          [ts.createTypeReferenceNode(`${name}TxEventLogs`, undefined)],
          ts.createRegularExpressionLiteral('TransactionReceipt'),
        ),
      ]),
    ],
    [],
  );
}

function getBaseType(input: AbiInput, returnValue: boolean) {
  const { type } = input;

  if (type.match(/u?int\d*/) || type.match(/u?fixed[0-9x]*/)) {
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

function getTsTypeFromSolidityType(input: AbiInput, returnValue: boolean) {
  const { type } = input;
  const baseType = getBaseType(input, returnValue);
  return type.match(/\[\]$/) ? ts.createArrayTypeNode(baseType) : baseType;
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

function getOutputType(name: string, definition: AbiDefinition) {
  if (!definition.stateMutability) {
    if (definition.outputs && definition.outputs.length) {
      return ts.createTypeReferenceNode('TxCall', [getTsTypeFromSolidityType(definition.outputs[0], true)]);
    } else {
      return ts.createTypeReferenceNode('TxSend', [ts.createTypeReferenceNode(`${name}TransactionReceipt`, undefined)]);
    }
  }
  if (definition.stateMutability === 'view' || definition.stateMutability === 'pure') {
    if (definition.outputs && definition.outputs.length) {
      return ts.createTypeReferenceNode('TxCall', [getTsTypeFromSolidityType(definition.outputs[0], true)]);
    } else {
      return undefined;
    }
  } else {
    return ts.createTypeReferenceNode('TxSend', [ts.createTypeReferenceNode(`${name}TransactionReceipt`, undefined)]);
  }
}

function makeMethod(name: string, definition: AbiDefinition) {
  return ts.createMethodSignature(
    undefined,
    definition.inputs!.map(makeParameter),
    getOutputType(name, definition),
    definition.name!,
    undefined,
  );
}

function makeMethodsInterface(name: string, abi: ContractAbi) {
  const methods = abi.filter(def => def.type === 'function').map(def => makeMethod(name, def));
  return ts.createInterfaceDeclaration(undefined, undefined, `${name}Methods`, undefined, undefined, methods);
}

function makeContract(name: string) {
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
            ts.createIdentifier('abi'),
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
          [ts.createTypeReferenceNode(`${name}Definition`, undefined)],
          ts.createRegularExpressionLiteral('Contract'),
        ),
      ]),
    ],
    [ctor],
  );
}

function makeDefinitionInterface(name: string) {
  const props = [
    ts.createPropertySignature(
      undefined,
      'methods',
      undefined,
      ts.createTypeReferenceNode(`${name}Methods`, undefined),
      undefined,
    ),
    ts.createPropertySignature(
      undefined,
      'events',
      undefined,
      ts.createTypeReferenceNode(`${name}Events`, undefined),
      undefined,
    ),
    ts.createPropertySignature(
      undefined,
      'eventLogs',
      undefined,
      ts.createTypeReferenceNode(`${name}EventLogs`, undefined),
      undefined,
    ),
  ];

  return ts.createInterfaceDeclaration(
    undefined,
    [ts.createToken(ts.SyntaxKind.ExportKeyword)],
    `${name}Definition`,
    undefined,
    undefined,
    props,
  );
}

function makeAbiExport(name: string) {
  return ts.createVariableStatement(
    [ts.createModifier(ts.SyntaxKind.ExportKeyword)],
    [ts.createVariableDeclaration(`${name}Abi`, undefined, ts.createIdentifier('abi'))],
  );
}

function makeFile(name: string, abi: ContractAbi, web3xPath: string) {
  const imports = makeImports(name, web3xPath);
  const eventTypes = makeEventTypes(abi);
  const eventLogTypes = makeEventLogInterfaces(abi);
  const eventsInterface = makeEventsInterface(name, abi);
  const eventLogsInterface = makeEventLogsInterface(name, abi);
  const eventTxLogsInterface = makeTxEventLogsInterface(name, abi);
  const txReceiptInterface = makeTransactionReceiptInterface(name);
  const methodsInterface = makeMethodsInterface(name, abi);
  const definitionInterface = makeDefinitionInterface(name);
  const contract = makeContract(name);
  const abiExport = makeAbiExport(name);

  return ts.createNodeArray([
    ...imports,
    ...eventTypes,
    ...eventLogTypes,
    eventsInterface,
    eventLogsInterface,
    eventTxLogsInterface,
    txReceiptInterface,
    methodsInterface,
    definitionInterface,
    contract,
    abiExport,
  ]);
}

async function getContractAbi(abiLocation: string | ContractAbi): Promise<ContractAbi> {
  if (Array.isArray(abiLocation)) {
    return abiLocation;
  } else if (abiLocation.match(/^http/)) {
    const response = await got(abiLocation, { json: true });
    return response.body;
  } else {
    const json = JSON.parse(fs.readFileSync(abiLocation).toString());
    if (Array.isArray(json)) {
      return json;
    } else if (json.abi && Array.isArray(json.abi)) {
      return json.abi;
    } else {
      throw new Error(`Unable to extract ABI from json at ${abiLocation}`);
    }
  }
}

async function makeAndWriteAbi(outputPath: string, name: string, abi: ContractAbi, web3xPath: string) {
  const abiOutputFile = `${outputPath}/${name}Abi.ts`;
  const output = `import { ContractAbi } from '${web3xPath}/contract';\nexport default ${JSON.stringify(
    abi,
    undefined,
    2,
  )} as ContractAbi;`;
  fs.writeFileSync(abiOutputFile, output);
  /*
  const jsonFile = ts.createSourceFile(
    'someFile.ts',
    JSON.stringify(abi),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  let thing: any = jsonFile.statements[0];

  const varStmt = ts.createVariableStatement(
    [ts.createModifier(ts.SyntaxKind.ExportKeyword)],
    [
      ts.createVariableDeclaration(
        `Abi`,
        undefined,
        ts.createAsExpression(thing.expression, ts.createTypeReferenceNode('ContractAbi', undefined)),
      ),
    ],
  );

  const resultFile = ts.createSourceFile('', '', ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
  resultFile.statements = ts.createNodeArray([varStmt]);
  fs.writeFileSync(abiOutputFile, printer.printFile(resultFile));
  */
}

export async function makeAndWriteFiles(
  outputPath: string,
  name: string,
  abiLocation: string | ContractAbi,
  web3xPath: string,
) {
  const interfaceOutputFile = `${outputPath}/${name}.ts`;
  const abi = await getContractAbi(abiLocation);

  const resultFile = ts.createSourceFile('', '', ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
  resultFile.statements = makeFile(name, abi, web3xPath);

  fs.writeFileSync(interfaceOutputFile, printer.printFile(resultFile));

  makeAndWriteAbi(outputPath, name, abi, web3xPath);
}

export function getWeb3xPath() {
  const pkg = JSON.parse(fs.readFileSync(__dirname + '/../../package.json').toString());
  return pkg.name;
}

async function main() {
  const configFile = process.argv[2] || 'contracts.json';
  const config = JSON.parse(fs.readFileSync(configFile).toString()) as Config;
  const { outputPath = './contracts', web3xPath = getWeb3xPath() } = config;

  mkdirp.sync(outputPath);

  await Promise.all(
    Object.entries(config.contracts).map(entry => makeAndWriteFiles(outputPath, entry[0], entry[1], web3xPath)),
  );
}

if (require.main === module) {
  main().catch(console.error);
}
