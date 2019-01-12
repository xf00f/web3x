import { ContractAbi } from '../../contract';

interface FileSource {
  source: 'files';
  name: string;
  abiFile: string;
  initDataFile?: string;
}

interface EtherscanSource {
  source: 'etherscan';
  name: string;
  net: string;
  address: string;
}

interface TruffleSource {
  source: 'truffle';
  name: string;
  buildFile: string;
}

interface InlineSource {
  source: 'inline';
  name: string;
  abi: ContractAbi;
  initData?: string;
}

export type ContractConfig = FileSource | EtherscanSource | TruffleSource | InlineSource;

export interface Config {
  web3xPath?: string;
  outputPath?: string;
  contracts: ContractConfig[];
}
