import { Owner } from './owner';
import { Transaction } from './transaction';
import { BlockChain } from './block-chain';
import { Miner } from './miner';

[new Miner('miner1'), new Miner('miner2')].forEach(miner => {
    let didPrint = false;

    Transaction.subscribe(allTransactions => {
        miner.createBlock(allTransactions).then(() => {
            const blockChain = BlockChain.tempBlocks[miner.id];

            if (!didPrint && blockChain.length > 1) {
                console.log('local blockchain of', miner.id);
                console.log(blockChain.map(x => x.toString()))
                console.log();

                didPrint = true;

                allTransactions.forEach(transaction => {
                    if (BlockChain.verifyTransaction(transaction.hash, blockChain[0].transactionTree)) {
                        console.log(transaction.hash, 'is in', blockChain[0].hash);
                    } else {
                        console.log(transaction.hash, 'is not in', blockChain[0].hash);
                    }
                });
            }
        })
    });
});

Transaction.subscribe((t) => {
    console.log('new transaction', t[0]?.hash);
});

const alice = new Owner();
const bob = new Owner();
const cecil = new Owner();

const transactions = [
    alice.send(bob, 1),
    bob.send(cecil, 1),
    cecil.send(bob, 1),
    bob.send(alice, 1),
    alice.send(bob, 1),
    bob.send(cecil, 1),
    cecil.send(bob, 1),
    bob.send(alice, 1)
];

Promise.all(transactions).then(t => {
    console.log(t.length, 'transactions were successful');
});
