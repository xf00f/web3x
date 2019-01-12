import fs from 'fs';
import { ContractAbi } from '../../contract';

export function getFromTruffle(buildFile: string): { abi: ContractAbi; initData?: string } {
  const { abi, bytecode: initData } = JSON.parse(fs.readFileSync(buildFile).toString());
  return { abi, initData };
}
