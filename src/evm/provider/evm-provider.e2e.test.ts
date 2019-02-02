import levelup from 'levelup';
import memdown from 'memdown';
import { Address } from '../../address';
import { Eth } from '../../eth';
import { toWei, utf8ToHex } from '../../utils';
import { EvmProvider } from './evm-provider';
import { DaiContract } from './fixtures/DaiContract';

describe('evm provider e2e tests', () => {
  it('should execute contract code', async () => {
    const provider = await EvmProvider.fromDb(levelup(memdown()));
    const eth = new Eth(provider);
    const daiContract = new DaiContract(eth);
    const account1 = Address.fromString('0xd7b2c3559672e470dc637a56962378f3b81030d3');
    const account2 = Address.fromString('0x019967dbe06f658caff098b819d2d91fab73a3b2');
    const gasPrice = 50000;

    eth.defaultFromAddress = account1;

    provider.worldState.checkpoint();
    await provider.worldState.createAccount(account1, BigInt(10) * BigInt(10) ** BigInt(18));
    await provider.worldState.commit();

    const deployReceipt = await daiContract
      .deploy(utf8ToHex('xf00f'))
      .send({ gasPrice })
      .getReceipt();

    expect(deployReceipt.events!.LogSetOwner[0].returnValues.owner).toEqual(account1);

    // Mint some DAI into account1.
    await daiContract.methods
      .mint(toWei('1000', 'ether'))
      .send({ gasPrice })
      .getReceipt();

    expect(await daiContract.methods.balanceOf(account1).call()).toBe(toWei('1000', 'ether'));
    expect(await daiContract.methods.allowance(account1, account2).call()).toBe(toWei('0', 'ether'));

    // Approve account2 to transfer the minted funds to itself.
    await daiContract.methods
      .approve(account2, toWei('1000', 'ether'))
      .send({ gasPrice })
      .getReceipt();

    expect(await daiContract.methods.allowance(account1, account2).call()).toBe(toWei('1000', 'ether'));

    // Transfer to account2.
    await daiContract.methods
      .transfer(account2, toWei('1000', 'ether'))
      .send({ from: account1, gasPrice })
      .getReceipt();

    expect(await daiContract.methods.balanceOf(account1).call()).toBe('0');
    expect(await daiContract.methods.balanceOf(account2).call()).toBe(toWei('1000', 'ether'));
  });
});
