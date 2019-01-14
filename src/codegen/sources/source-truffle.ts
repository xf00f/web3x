import fs from 'fs';
import { ContractAbiDefinition } from '../../contract';

export function getFromTruffle(buildFile: string): { abi: ContractAbiDefinition; initData?: string } {
  const { abi, bytecode: initData } = JSON.parse(fs.readFileSync(buildFile).toString());
  return { abi, initData };
}
