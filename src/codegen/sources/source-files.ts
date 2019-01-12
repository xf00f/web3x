import fs from 'fs';
import { ContractAbi } from '../../contract';

export function getFromFiles(abiFile: string, initDataFile?: string) {
  const abi: ContractAbi = JSON.parse(fs.readFileSync(abiFile).toString());

  if (initDataFile) {
    const initData = fs.readFileSync(initDataFile).toString();
    return { abi, initData };
  }

  return { abi };
}
