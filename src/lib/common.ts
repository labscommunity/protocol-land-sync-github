import { getAddress } from './arweaveHelper';
import type { Repo } from '../types';
import { execSync } from 'child_process';
import type { JsonWebKey } from 'crypto';
import 'dotenv/config';

const ANSI_RESET = '\x1b[0m';
const ANSI_RED = '\x1b[31m';
const ANSI_GREEN = '\x1b[32m';

export const PL_TMP_PATH = '.protocol.land';
export const CONTRACT_TXID = 'B8gmo1897cyCjShP7QRe1XndatqLMieeymxehBK_oL8';

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

let wallet: JsonWebKey | null = null;

export const getWallet = () => {
    if (wallet) return wallet as any;
    try {
        wallet = JSON.parse(process.env.WALLET as string);
        return wallet as any;
    } catch (error) {
        return '';
    }
};

export const ownerOrContributor = async (
    repo: Repo,
    wallet: JsonWebKey,
    options: { pushing: boolean } = { pushing: false }
) => {
    const { pushing } = options;
    const address = await getAddress(wallet);
    const ownerOrContrib =
        repo.owner === address ||
        repo.contributors.some((contributor) => contributor === address);
    if (!ownerOrContrib) notOwnerOrContributorMessage({ warn: !pushing });
    return ownerOrContrib;
};

export const notOwnerOrContributorMessage = (
    params: { warn: boolean } = { warn: false }
) => {
    const { warn } = params;
    if (warn) {
        log(
            `You are not the repo owner nor a contributor. You will need an owner or contributor jwk to push to this repo.`,
            { color: 'green' }
        );
    } else {
        log(
            `You are not the repo owner nor a contributor. You can't push to this repo.`,
            { color: 'red' }
        );
    }
    return null;
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

export const exitWithError = (message: string) => {
    log(``);
    log(`${message}`);
    log(``);
    process.exit(1);
};
