import got from 'got';
import { Address } from '../../address';
import { ContractAbi } from '../../contract';

function getHost(net: string) {
  switch (net) {
    case 'mainnet':
      return 'etherscan.io';
    case 'kovan':
      return 'kovan.etherscan.io';
    default:
      throw new Error(`Unknown network ${net}`);
  }
}

function getApiHost(net: string) {
  switch (net) {
    case 'mainnet':
      return 'api.etherscan.io';
    case 'kovan':
      return 'api-kovan.etherscan.io';
    default:
      throw new Error(`Unknown network ${net}`);
  }
}

async function getAbi(net: string, address: Address): Promise<ContractAbi> {
  const host = getApiHost(net);
  const abiUrl = `http://${host}/api?module=contract&action=getabi&address=${address}&format=raw`;
  const response = await got(abiUrl, { json: true });
  return response.body;
}

async function getInitData(net: string, address: Address) {
  const host = getHost(net);
  const response: string = (await got(`https://${host}/address/${address}`)).body;
  const initCodeMd = response.match(/<div id='verifiedbytecode2'>([0-9a-f]+)</);

  if (!initCodeMd) {
    return;
  }

  const initCode = '0x' + initCodeMd![1];

  const ctorParamsMd = response.match(
    /last bytes of the Contract Creation Code above.*?margin-top: 5px;'>([0-9a-f]+)</,
  );

  if (ctorParamsMd) {
    const ctorParams = ctorParamsMd![1];
    if (!initCode.endsWith(ctorParams)) {
      throw new Error('Expected ctor params to be appended to end of init code.');
    }
    return initCode.slice(0, -ctorParams.length);
  }

  return initCode;
}

export async function getFromEtherscan(net: string, address: Address) {
  const abi = await getAbi(net, address);
  const initData = await getInitData(net, address);

  return { abi, initData };
}
