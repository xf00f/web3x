import levelup from 'levelup';
import memdown from 'memdown';
import { Eth } from '../../eth';
import { toWei, utf8ToHex } from '../../utils';
import { Wallet } from '../../wallet';
import { EvmProvider } from './evm-provider';
import { DaiContract } from './fixtures/DaiContract';

describe('evm provider e2e tests', () => {
  const wallet = new Wallet(10);
  const account1 = wallet.get(0)!.address;
  const account2 = wallet.get(1)!.address;
  const gasPrice = 50000;
  let provider!: EvmProvider;
  let eth!: Eth;
  let daiContract!: DaiContract;

  beforeEach(async () => {
    provider = await EvmProvider.fromDb(levelup(memdown()));
    await provider.loadWallet(wallet);

    eth = new Eth(provider);
    daiContract = new DaiContract(eth, undefined, { gasPrice });

    eth.defaultFromAddress = account1;
  });

  it('should execute contract code', async () => {
    const deployReceipt = await daiContract
      .deploy(utf8ToHex('xf00f'))
      .send()
      .getReceipt();

    expect(deployReceipt.events!.LogSetOwner[0].returnValues.owner).toEqual(account1);

    // Mint some DAI into account1.
    await daiContract.methods
      .mint(toWei('1000', 'ether'))
      .send()
      .getReceipt();

    expect(await daiContract.methods.balanceOf(account1).call()).toBe(toWei('1000', 'ether'));
    expect(await daiContract.methods.allowance(account1, account2).call()).toBe(toWei('0', 'ether'));

    // Approve account2 to transfer the minted funds to itself.
    await daiContract.methods
      .approve(account2, toWei('1000', 'ether'))
      .send()
      .getReceipt();

    expect(await daiContract.methods.allowance(account1, account2).call()).toBe(toWei('1000', 'ether'));

    // Transfer 600 to account2.
    await daiContract.methods
      .transferFrom(account1, account2, toWei('600', 'ether'))
      .send({ from: account2 })
      .getReceipt();

    expect(await daiContract.methods.allowance(account1, account2).call()).toBe(toWei('400', 'ether'));
    expect(await daiContract.methods.balanceOf(account1).call()).toBe(toWei('400', 'ether'));
    expect(await daiContract.methods.balanceOf(account2).call()).toBe(toWei('600', 'ether'));

    // Transfer 400 to account2.
    const transferReceipt = await daiContract.methods
      .transferFrom(account1, account2, toWei('400', 'ether'))
      .send({ from: account2 })
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
  }, 10000);

  it('should receive Transfer event', async done => {
    await daiContract
      .deploy(utf8ToHex('xf00f'))
      .send()
      .getReceipt();

    await daiContract.methods
      .mint(toWei('1000', 'ether'))
      .send()
      .getReceipt();

    const sub = daiContract.events.Transfer({}, (err, log) => {
      if (err) {
        done(err);
      }
      expect(log.returnValues.src).toEqual(account1);
      expect(log.returnValues.dst).toEqual(account2);
      expect(log.returnValues.wad).toEqual(toWei('600', 'ether'));
      sub.unsubscribe();
      done();
    });

    await daiContract.methods
      .transfer(account2, toWei('600', 'ether'))
      .send()
      .getReceipt();
  });
});
