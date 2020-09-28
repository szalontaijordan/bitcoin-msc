import MerkleTree from 'merkletreejs';

import { Transaction } from './transaction';
import { hashContent, isWorkProved, toBytes } from './utils';

export class BlockChain {

    public static blocks: Block[] = [];
    public static tempBlocks: Record<string, Block[]> = {};

    public static createBlock(chain: Block[], transactions: Transaction[]): Block {
        const prevHash = chain[0]?.hash || hashContent('first block');
        return new Block(prevHash, transactions);
    }

    public static branch(id: string, blocks: Block[]): void {
        BlockChain.tempBlocks[id] = blocks;
    }

    public static verifyTransaction(tHash: string, treeRoot: MerkleTree): boolean {
        if (!treeRoot) {
            return false;
        }

        const hashBytes = Buffer.from(toBytes(tHash));
        const rootBytes = Buffer.from(toBytes(treeRoot.getHexRoot()));
        const proof = treeRoot.getProof(hashBytes);
        return treeRoot.verify(proof, hashBytes, rootBytes);
    }
}

export class Block {

    nonce: number;
    hash: string;
    transactionTree: MerkleTree;
    ts: number;

    constructor(public prevBlockHash: string, transactions: Transaction[]) {
        const merkleTree = new MerkleTree(transactions.map(t => t.hash), hashContent, {
            isBitcoinTree: true
        });

        this.transactionTree = merkleTree;
        this.ts = new Date().getTime();

        let nonce = 0;
        let hash = '';
        const transactionRoot = merkleTree.getHexRoot();

        while (true) {
            hash = hashContent(prevBlockHash + transactionRoot + `${nonce}` + `${this.ts}`);
            if (isWorkProved(hash, 4)) {
                break;
            }
            nonce++;
        }

        this.hash = hash;
        this.nonce = nonce;
    }

    public toString(): string {
        return JSON.stringify({
            nonce: this.nonce,
            hash: this.hash,
            prevBlock: this.prevBlockHash,
            ts: this.ts,
            merkleRoot: this.transactionTree.getHexRoot()
        }, null, 2);
    }
}
