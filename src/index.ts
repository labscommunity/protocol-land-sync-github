#!/usr/bin/env node

import { existsSync, mkdirSync } from 'fs';
import {
    downloadProtocolLandRepo,
    githubInitialize,
    syncProtocolLandRepoToGithub,
} from './lib/protocolLandSync';
import path from 'path';
import { PL_TMP_PATH, clearCache, log } from './lib/common';

export const main = async () => {
    try {
        // get tmp path for remote (throws if can't create a tmp path)
        const tmpPath = getTmpPath();

        const repoId = process.env.PL_REPO_ID as string;

        // download protocol land repo latest version to tmpRemotePath
        const repo = await downloadProtocolLandRepo(repoId, tmpPath);

        const currentDirectory = process.cwd();

        const repoPath = path.join(currentDirectory, tmpPath, repo.id);
        let destUrl;
        if (process.env.GITHUB_TOKEN) {
            destUrl = `https://oauth2:${process.env.GITHUB_TOKEN}@github.com/${process.env.GH_REPO_NAME}.git`;
        } else {
            destUrl = `git@github.com:${process.env.GH_REPO_NAME}.git`;
        }

        await githubInitialize();

        // sync to git
        await syncProtocolLandRepoToGithub(repo, repoPath, destUrl);

        process.chdir(currentDirectory);

        clearCache(tmpPath, { keepFolders: [] });
    } catch (error: any) {
        log(error?.message || error, { color: 'red' });
        process.exit(1);
    }
};

function getTmpPath() {
    const tmpPath = path.join('.git', PL_TMP_PATH);

    // Check if the tmp folder exists, and create it if it doesn't
    if (!existsSync(tmpPath)) {
        mkdirSync(tmpPath, { recursive: true });
        if (!existsSync(tmpPath))
            throw new Error(`Failed to create the directory: ${tmpPath}`);
    }
    return tmpPath;
}

main();
