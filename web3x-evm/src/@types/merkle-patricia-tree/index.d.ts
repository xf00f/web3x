/*
  Copyright (c) 2019 xf00f

  This file is part of web3x and is released under the MIT License.
  https://opensource.org/licenses/MIT
*/

declare module 'merkle-patricia-tree' {
  import { Readable } from 'stream';

  export default class Trie {
    readonly root: Buffer;
    readonly isCheckpoint: boolean;
    readonly EMPTY_TRIE_ROOT: Buffer;

    constructor(db?: object, root?: Buffer | string);
    get(key: Buffer | string, cb: (err: Error, value: Buffer) => void): void;
    put(key: Buffer | string, value: Buffer | string, cb: (err: Error) => void): void;
    del(key: Buffer | string, cb: (err: Error) => void): void;
    getRaw(key: Buffer | string, cb: (err: Error, value: Buffer) => void): void;
    putRaw(key: Buffer | string, value: Buffer, cb: (err: Error) => void): void;
    delRaw(key: Buffer | string, cb: (err: Error) => void): void;
    createReadStream(): Readable;
    batch(ops: { type: 'get' | 'put' | 'del'; key: Buffer | string; value?: Buffer | string }[], cb: () => void): void;
    checkRoot(root: Buffer, cb: (exists: boolean) => void): void;
    checkpoint(): void;
    commit(cb: () => void): void;
    revert(cb: () => void): void;

    static prove(trie: Trie, key: string, cb: (err: Error, proof: any[]) => void): void;
    static verifyProof(rootHash: Buffer, key: string, proof: any[], cb: (err: Error, value: string) => void): void;
  }
}
