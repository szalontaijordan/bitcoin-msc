import forge from "node-forge";

export function toBytes(hex: string): Uint8Array {
    return new Uint8Array(hex.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16)))
}

export function hashContent(s: string): string {
    return forge.md.sha256.create().update(s).digest().toHex();
}

export function isWorkProved(hash: string, numberOfZeros: number): boolean {
    const zeros = new Array(numberOfZeros).fill(0).join('');

    return hash.startsWith(zeros);
}
