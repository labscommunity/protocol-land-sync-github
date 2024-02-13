import { getRepo } from './warpHelper';
import { spawn } from 'child_process';
import { arweaveDownload } from './arweaveHelper';
import { unpackGitRepo } from './zipHelper';
import type { Repo } from '../types';
import { clearCache, log } from './common';
import { decryptRepo } from './privateRepo';

export const downloadProtocolLandRepo = async (
    repoId: string,
    destPath: string
) => {
    log(`Getting latest repo from Protocol.Land into '${destPath}' ...`);

    // find repo in Protocol Land's warp contract
    let repo: Repo | undefined;
    try {
        repo = await getRepo(repoId, destPath);
    } catch (err) {
        log(err);
    }

    // if repo not found, exit gracefully
    if (!repo) {
        log(`Repo '${repoId}' not found`, { color: 'red' });
        log(`Please create a repo in https://protocol.land first`, {
            color: 'green',
        });
        process.exit(0);
    }

    // if not, download repo data from arweave
    log(`Downloading from arweave with txId '${repo.dataTxId}' ...`);
    let arrayBuffer = await arweaveDownload(repo.dataTxId);
    if (!arrayBuffer) {
        log('Failed to fetch repo data from arweave.', { color: 'red' });
        log('Check connection or repo integrity in https://protocol.land', {
            color: 'green',
        });
        process.exit(0);
    }

    const isPrivate = repo?.private || false;
    const privateStateTxId = repo?.privateStateTxId;

    if (isPrivate && privateStateTxId) {
        arrayBuffer = await decryptRepo(arrayBuffer, privateStateTxId);
    }

    // unzip repo into destPath
    log(`Unpacking downloaded repo ...`);
    const status = await unpackGitRepo({ destPath, arrayBuffer });

    if (!status) {
        log('Unpacking failed!', { color: 'red' });
        log('Check repo integrity in https://protocol.land', {
            color: 'green',
        });
        process.exit(0);
    }

    // rm -rf everything but the bare repo and warp cache (discard stdout)
    try {
        clearCache(destPath, { keepFolders: ['cache', repo.id] });
    } catch {}

    return repo;
};

export const syncProtocolLandRepoToGithub = async (
    repoPath: string,
    destUrl: string
) => {
    process.chdir(repoPath);
    try {
        const forcePush = process.env.FORCE_PUSH === 'true';
        const args = ['push', destUrl, '--all'];
        if (forcePush) args.splice(1, 0, '-f');
        const pushed = await runCommand('git', args, { forwardStdOut: true });

        if (!pushed) {
            log('Failed to push to remote!', { color: 'red' });
            process.exit(0);
        }
    } catch (error: any) {
        log(error?.message || error, { color: 'red' });
    }
};

export const githubInitialize = async () => {
    const GITHUB_ACTOR = process.env.GITHUB_ACTOR;
    const GITHUB_ACTOR_ID = process.env.GITHUB_ACTOR_ID;
    if (GITHUB_ACTOR) {
        await runCommand('git', [
            'config',
            '--global',
            'user.name',
            `"${GITHUB_ACTOR}"`,
        ]).catch(() => {});

        if (GITHUB_ACTOR_ID) {
            await runCommand('git', [
                'config',
                '--global',
                'user.email',
                `"${GITHUB_ACTOR_ID}+${GITHUB_ACTOR}@users.noreply.github.com"`,
            ]).catch(() => {});
        }
    }
};

/** @notice spawns a command with args, optionally forwarding stdout to stderr */
const runCommand = async (
    command: string,
    args: string[],
    options?: { forwardStdOut: boolean }
) => {
    log(`Running '${command} ${args.join(' ')}' ...`);
    const child = spawn(command, args, {
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe'],
    });
    return await new Promise<boolean>((resolve, reject) => {
        child.on('error', reject);
        if (options?.forwardStdOut) {
            // forward stdout to stderr (to be shown in console)
            child.stdout.on('data', (data) => log);
        }
        child.on('close', (code) => {
            if (code === 0) {
                resolve(true);
            } else {
                log(`Command Failed. Exit code: ${code}`);
                resolve(false);
            }
        });
    });
};
