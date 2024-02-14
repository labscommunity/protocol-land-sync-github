import Arweave from 'arweave';
import { getWallet } from './common';
import { withAsync } from './withAsync';
import type { JsonWebKey } from 'crypto';

export async function getAddress(wallet?: JsonWebKey) {
    return await initArweave().wallets.jwkToAddress(wallet ?? getWallet());
}

export function getActivePublicKey() {
    const wallet = getWallet();
    if (!wallet) {
        process.exit(1);
    }
    return wallet.n;
}

export function initArweave() {
    return Arweave.init({
        host: 'arweave.net',
        port: 443,
        protocol: 'https',
    });
}

export async function arweaveDownload(txId: string) {
    const { response, error } = await withAsync(() =>
        fetch(`https://arweave.net/${txId}`)
    );

    if (error) {
        throw new Error(error as string);
    } else if (response) {
        return await response.arrayBuffer();
    }
}
