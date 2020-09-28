import * as forge from 'node-forge';
import { Transaction } from './transaction';
import { toBytes } from './utils';
import { BlockChain } from './block-chain';

export class Owner {

    public pk: string;
    private readonly sk: string;

    constructor() {
        const keypair = forge.pki.ed25519.generateKeyPair({
            seed: forge.random.getBytesSync(32)
        });
        this.pk = keypair.publicKey.toString('hex');
        this.sk = keypair.privateKey.toString('hex');
    }

    send(toOwner: Owner, btc: number): Promise<Transaction> {
        const prevT =  Transaction.transactions[0];

        if (!this.verify(prevT)) {
            throw Error('Cannot send btc');
        }

        const privateKey = toBytes(this.sk);

        return Promise.resolve(new Transaction({
            prevHash: prevT.hash,
            signature: forge.pki.ed25519.sign({
                message: toOwner.pk,
                privateKey,
                encoding: 'utf8'
            }).toString('hex'),
            from: this.pk
        }, {
            to: forge.md.sha256.create().update(toOwner.pk).digest().toHex(),
            value: btc
        }));
    }

    private verify(t: Transaction): boolean {
        if (Transaction.transactions.length === 1) {
            return true;
        }

        const { signature, from } = t.input;

        const isPKeyOK = forge.md.sha256.create().update(this.pk).digest().toHex() === t.output.to;
        const isSignatureOK = forge.pki.ed25519.verify({
            message: this.pk,
            publicKey: toBytes(from),
            signature: toBytes(signature),
            encoding: 'utf8'
        });

        return isPKeyOK && isSignatureOK;
    }
}
