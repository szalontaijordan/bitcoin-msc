import { Transaction } from './transaction';
import { Block, BlockChain } from './block-chain';

export class Miner {

    constructor(public id: string, public offset = 0, public pending = false) {
    }

    public async createBlock(allTransactions: Transaction[]): Promise<void> {
        const transactionsInBlock = 4;
        let localChain = [ ...(BlockChain.tempBlocks[this.id] || BlockChain.blocks) ];
        const transactions = [...allTransactions].slice(this.offset);

        if (transactions.length % transactionsInBlock === 0) {
            const block: Block = await new Promise(resolve => {
                const newBlock = BlockChain.createBlock(localChain, transactions);
                this.offset += transactionsInBlock;
                localChain.unshift(newBlock);

                console.log('Possible new block from', newBlock.hash);
                BlockChain.branch(this.id, localChain);

                this.pending = false;

                resolve(newBlock);
            });
        }
    }
}
