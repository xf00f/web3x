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
    await provider.worldState.createAccount(account2, BigInt(10) * BigInt(10) ** BigInt(18));
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

    // Transfer 600 to account2.
    await daiContract.methods
      .transferFrom(account1, account2, toWei('600', 'ether'))
      .send({ from: account2, gasPrice })
      .getReceipt();

    expect(await daiContract.methods.allowance(account1, account2).call()).toBe(toWei('400', 'ether'));
    expect(await daiContract.methods.balanceOf(account1).call()).toBe(toWei('400', 'ether'));
    expect(await daiContract.methods.balanceOf(account2).call()).toBe(toWei('600', 'ether'));

    // Transfer 400 to account2.
    const transferReceipt = await daiContract.methods
      .transferFrom(account1, account2, toWei('400', 'ether'))
      .send({ from: account2, gasPrice })
      .getReceipt();

    const transferEvent = transferReceipt.events!.Transfer[0].returnValues;
    expect(transferEvent.src).toEqual(account1);
    expect(transferEvent.dst).toEqual(account2);
    expect(transferEvent.wad).toEqual(toWei('400', 'ether'));

    expect(await daiContract.methods.allowance(account1, account2).call()).toBe(toWei('0', 'ether'));
    expect(await daiContract.methods.balanceOf(account1).call()).toBe('0');
    expect(await daiContract.methods.balanceOf(account2).call()).toBe(toWei('1000', 'ether'));

    const logs = await daiContract.getPastEvents('Transfer', { fromBlock: 0 });

    expect(logs).toHaveLength(2);
    expect(logs[0].returnValues.src).toEqual(account1);
    expect(logs[0].returnValues.dst).toEqual(account2);
    expect(logs[0].returnValues.wad).toEqual(toWei('600', 'ether'));
    expect(logs[1].returnValues.src).toEqual(account1);
    expect(logs[1].returnValues.dst).toEqual(account2);
    expect(logs[1].returnValues.wad).toEqual(toWei('400', 'ether'));
  });
});
