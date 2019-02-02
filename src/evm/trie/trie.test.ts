import levelup from 'levelup';
import memdown from 'memdown';
import { Trie } from './trie';

describe('trie', () => {
  it('should return null if put empty buffer', async () => {
    const db = levelup(memdown());
    const trie = new Trie(db);
    await trie.put(Buffer.from('mykey'), Buffer.from(''));
    const value = await trie.get(Buffer.from('mykey'));
    expect(value).toBe(null);
  });

  it('should return 0 if put 0', async () => {
    const db = levelup(memdown());
    const trie = new Trie(db);
    await trie.put(Buffer.from('mykey'), Buffer.of(0));
    const value = await trie.get(Buffer.from('mykey'));
    expect(value).toEqual(Buffer.of(0));
  });

  it('minimum test that breaks with secure merkle', async () => {
    const db = levelup(memdown());

    const trie = new Trie(db);

    const key1 = Buffer.from('0000000000000000000000000000000000000010', 'hex');
    const key2 = Buffer.from('0000000000000000000000000000000000000008', 'hex');

    await trie.put(key1, Buffer.of(123));
    await trie.put(key2, Buffer.of(123));

    await db.put('1', Buffer.of(123));

    const account1 = await trie.get(key1);

    expect(account1).not.toBeFalsy();
  });

  it('minimum test that breaks when putting a string', async () => {
    const db = levelup(memdown());

    const trie1 = new Trie(db);
    const trie2 = new Trie(db);

    const key1 = Buffer.from('ffffff', 'hex');
    const val1 = Buffer.from('afafaf', 'hex');
    await trie1.put(key1, val1);

    const key2 = Buffer.from('ababab', 'hex');
    const val2 = Buffer.from('deadbeef', 'hex');
    await trie2.put(key2, val2);

    // Changing this from a buffer to a string breaks this test. Should it?
    await db.put(Buffer.from('thisbreaks'), Buffer.from('bdbdbd', 'hex'));

    const result1 = await trie1.get(key1);
    const result2 = await trie2.get(key2);

    expect(result1).toEqual(val1);
    expect(result2).toEqual(val2);
  });
});
