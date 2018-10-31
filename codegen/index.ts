import fs from 'fs';
import ts from 'typescript';
import { ContractAbi, AbiInput } from '../src/contract';
import { AbiDefinition } from '../dest/contract';

const printer = ts.createPrinter({
  newLine: ts.NewLineKind.LineFeed,
});

interface Config {
  abiPath?: string;
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

function makeImports() {
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
        ts.createNamedImports([ts.createImportSpecifier(undefined, ts.createIdentifier('Contract'))]),
      ),
      ts.createRegularExpressionLiteral("'web3x-es/contract'"),
    ),
  ];
}

function makeInterface(name: string, abi: ContractAbi) {
  const interfaceName = ts.createIdentifier(`${name}Definition`);
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
    interfaceName,
    undefined,
    undefined,
    props,
  );

  const imports = makeImports();

  const alias = ts.createClassDeclaration(
    undefined,
    [ts.createToken(ts.SyntaxKind.ExportKeyword)],
    name,
    undefined,
    [
      ts.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
        ts.createExpressionWithTypeArguments(
          [ts.createTypeReferenceNode(interfaceName, undefined)],
          ts.createRegularExpressionLiteral('Contract'),
        ),
      ]),
    ],
    [],
  );

  return ts.createNodeArray([...imports, methodsInterface, eventsInterface, definitionInterface, alias]);
}

async function generateInterface(abiPath: string, outputPath: string, name: string, location: string) {
  const abiFile = `${abiPath}/${name}.json`;
  const abi = JSON.parse(fs.readFileSync(abiFile).toString()) as ContractAbi;

  const resultFile = ts.createSourceFile('someFileName.ts', '', ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
  resultFile.statements = makeInterface(name, abi);

  const result = printer.printFile(resultFile);
  console.log(result);
}

async function main() {
  const configFile = process.argv[2] || 'contracts.json';
  const config = JSON.parse(fs.readFileSync(configFile).toString()) as Config;
  const { abiPath = 'abi', outputPath = 'contracts' } = config;

  await Promise.all(Object.entries(config.contracts).map(entry => generateInterface(abiPath, outputPath, ...entry)));
}

main().catch(console.error);
