/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

import levelup from 'levelup';
import memdown from 'memdown';
import { Address } from 'web3x/address';
import { WorldState } from './world-state';

describe('world-state', () => {
  const address1 = Address.fromString('0x0000000000000000000000000000000000000010');
  const address2 = Address.fromString('0x0000000000000000000000000000000000000020');
  const address3 = Address.fromString('0x0000000000000000000000000000000000000030');

  it('should commit account storage correctly', async () => {
    const db = levelup(memdown());
    const worldState = await WorldState.fromDb(db);

    worldState.checkpoint();
    await worldState.createAccount(address1, BigInt(1000), BigInt(0), Buffer.from('deadbeef', 'hex'));
    await worldState.commit();

    const account = await worldState.loadImmutableAccount(address1);

    expect(account!.balance).toBe(BigInt(1000));
    expect(account!.nonce).toBe(BigInt(0));
    expect(account!.code).toEqual(Buffer.from('deadbeef', 'hex'));
  });

  it('should commit multiple checkpoints correctly', async () => {
    const db = levelup(memdown());
    const worldState = await WorldState.fromDb(db);

    worldState.checkpoint();

    await worldState.createAccount(address1, BigInt(1000));
    await worldState.createAccount(address2, BigInt(2000));

    worldState.checkpoint();

    {
      const account2 = await worldState.loadAccount(address2);
      expect(account2!.balance).toBe(BigInt(2000));
      account2!.balance = BigInt(2500);
    }

    worldState.checkpoint();

    await worldState.createAccount(address3, BigInt(3000));

    {
      const account1 = await worldState.loadAccount(address1);
      const account2 = await worldState.loadAccount(address2);
      const account3 = await worldState.loadAccount(address3);
      expect(account1!.balance).toBe(BigInt(1000));
      expect(account2!.balance).toBe(BigInt(2500));
      expect(account3!.balance).toBe(BigInt(3000));
    }

    await worldState.commit();

    {
      const account1 = await worldState.loadAccount(address1);
      const account2 = await worldState.loadAccount(address2);
      const account3 = await worldState.loadAccount(address3);
      expect(account1!.balance).toBe(BigInt(1000));
      expect(account2!.balance).toBe(BigInt(2500));
      expect(account3!.balance).toBe(BigInt(3000));
    }

    await worldState.commit();

    {
      const account1 = await worldState.loadAccount(address1);
      const account2 = await worldState.loadAccount(address2);
      const account3 = await worldState.loadAccount(address3);
      expect(account1!.balance).toBe(BigInt(1000));
      expect(account2!.balance).toBe(BigInt(2500));
      expect(account3!.balance).toBe(BigInt(3000));
    }

    await worldState.commit();

    {
      worldState.checkpoint();
      const account1 = await worldState.loadAccount(address1);
      const account2 = await worldState.loadAccount(address2);
      const account3 = await worldState.loadAccount(address3);
      expect(account1!.balance).toBe(BigInt(1000));
      expect(account2!.balance).toBe(BigInt(2500));
      expect(account3!.balance).toBe(BigInt(3000));
    }
  });

  it('should revert checkpoint correctly', async () => {
    const db = levelup(memdown());
    const worldState = await WorldState.fromDb(db);

    worldState.checkpoint();

    await worldState.createAccount(address1, BigInt(1000));
    await worldState.createAccount(address2, BigInt(2000));

    worldState.checkpoint();

    {
      const account2 = await worldState.loadAccount(address2);
      account2!.balance = BigInt(2500);
    }

    worldState.checkpoint();

    await worldState.createAccount(address3, BigInt(3000));

    {
      const account1 = await worldState.loadAccount(address1);
      const account2 = await worldState.loadAccount(address2);
      const account3 = await worldState.loadAccount(address3);
      expect(account1!.balance).toBe(BigInt(1000));
      expect(account2!.balance).toBe(BigInt(2500));
      expect(account3!.balance).toBe(BigInt(3000));
    }

    await worldState.revert();

    {
      const account1 = await worldState.loadAccount(address1);
      const account2 = await worldState.loadAccount(address2);
      const account3 = await worldState.loadAccount(address3);
      expect(account1!.balance).toBe(BigInt(1000));
      expect(account2!.balance).toBe(BigInt(2500));
      expect(account3).toBeUndefined();
    }

    await worldState.revert();

    {
      const account1 = await worldState.loadAccount(address1);
      const account2 = await worldState.loadAccount(address2);
      const account3 = await worldState.loadAccount(address3);
      expect(account1!.balance).toBe(BigInt(1000));
      expect(account2!.balance).toBe(BigInt(2000));
      expect(account3).toBeUndefined();
    }

    await worldState.revert();

    {
      worldState.checkpoint();
      const account1 = await worldState.loadAccount(address1);
      const account2 = await worldState.loadAccount(address2);
      const account3 = await worldState.loadAccount(address3);
      expect(account1).toBeUndefined();
      expect(account2).toBeUndefined();
      expect(account3).toBeUndefined();
    }
  });
});
