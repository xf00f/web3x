import fs from 'fs';
import { ContractAbiDefinition } from '../../contract/abi';

export function getFromFiles(abiFile: string, initDataFile?: string) {
  const abi: ContractAbiDefinition = JSON.parse(fs.readFileSync(abiFile).toString());

  if (initDataFile) {
    const initData = fs.readFileSync(initDataFile).toString();
    return { abi, initData };
  }

  return { abi };
}
