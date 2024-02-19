import { getAddress } from './arweaveHelper';
import type { Repo } from '../types';
import { execSync } from 'child_process';
import type { JsonWebKey } from 'crypto';
import 'dotenv/config';

const ANSI_RESET = '\x1b[0m';
const ANSI_RED = '\x1b[31m';
const ANSI_GREEN = '\x1b[32m';

export const PL_TMP_PATH = '.protocol.land';
export const CONTRACT_TXID = 'w5ZU15Y2cLzZlu3jewauIlnzbKw-OAxbN9G5TbuuiDQ';
let wallet: JsonWebKey | null = null;

export const log = (message: any, options?: { color: 'red' | 'green' }) => {
    if (!options) console.error(` [PL] ${message}`);
    else {
        const { color } = options;
        console.error(
            `${
                color === 'red' ? ANSI_RED : ANSI_GREEN
            } [PL] ${message}${ANSI_RESET}`
        );
    }
};

export const getWallet = () => {
    if (wallet) return wallet as any;
    try {
        wallet = JSON.parse(process.env.WALLET as string);
        return wallet as any;
    } catch (error) {
        return '';
    }
};

export const ownerOrContributor = async (repo: Repo, wallet: JsonWebKey) => {
    const address = await getAddress(wallet);
    const ownerOrContrib =
        repo.owner === address ||
        repo.contributors.some((contributor) => contributor === address);
    return ownerOrContrib;
};

export function clearCache(
    cachePath: string,
    options: { keepFolders: string[] }
) {
    const { keepFolders = [] } = options;
    const ommitedFolders = keepFolders.map((v) => `! -name "${v}"`).join(' ');
    execSync(
        `find ${cachePath} -mindepth 1 -maxdepth 1 -type d ${ommitedFolders} -exec rm -rf {} \\;`
    );
}

export const waitFor = (delay: number) =>
    new Promise((res) => setTimeout(res, delay));
