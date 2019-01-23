import { LevelUp } from 'levelup';
import MerklePatriciaTree from 'merkle-patricia-tree';

export class Trie {
  private trie: MerklePatriciaTree;

  constructor(public db?: LevelUp, stateRoot?: Buffer) {
    this.trie = new MerklePatriciaTree(db, stateRoot);
  }

  public get root() {
    return this.trie.root;
  }

  public async get(key: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      this.trie.get(key, (err, value) => {
        if (err) {
          return reject(err);
        } else {
          return resolve(value);
        }
      });
    });
  }

  public async put(key: Buffer, value: Buffer): Promise<void> {
    return new Promise((resolve, reject) =>
      this.trie.put(key, value, err => {
        if (err) {
          return reject(err);
        } else {
          return resolve();
        }
      }),
    );
  }
}
