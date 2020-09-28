import * as forge from 'node-forge';
import { hashContent } from './utils';
import has = Reflect.has;
import { BlockChain } from './block-chain';

interface TransactionInput {
    prevHash: string;
    signature: string;
    from: string;
}

interface TransactionOutput {
    value: number;
    to: string;
}

interface TransactionType {
    input: TransactionInput;
    output: TransactionOutput;
}

type TransactionSubscription = (transactions: Transaction[]) => void;
type TransactionUnsubscribe = () => void;

export class Transaction implements TransactionType {

    public static transactions: Transaction[] = [{ hash: hashContent('first transaction') } as Transaction];
    private static subscriptions: Array<{ id: number; fn: Function }> = [];

    constructor(public input: TransactionInput, public output: TransactionOutput) {
        Transaction.transactions.unshift(this);
        Transaction.subscriptions.forEach(subscription => subscription.fn(Transaction.transactions));
    }

    public static subscribe(fn: TransactionSubscription): TransactionUnsubscribe {
        const id = Transaction.transactions.length;
        Transaction.subscriptions.push({ id, fn });

        return () => {
            Transaction.subscriptions = Transaction.subscriptions.filter(s => s.id !== id);
        };
    }

    get hash(): string {
        const contents = JSON.stringify(this.input) + JSON.stringify(this.output);
        return hashContent(contents);
    }
}
