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
});
