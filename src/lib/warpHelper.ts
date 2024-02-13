import {
    LoggerFactory,
    WarpFactory,
    defaultCacheOptions,
    type LogLevel,
} from 'warp-contracts/mjs';
import { CONTRACT_TXID } from './common';
import type { Repo } from '../types';
import path from 'path';

export const getWarpCacheOptions = (cachePath: string) => {
    return {
        ...defaultCacheOptions,
        dbLocation: path.join(cachePath, defaultCacheOptions.dbLocation),
    };
};

const getWarp = (destPath?: string, logLevel?: LogLevel) => {
    // set warp log level to none
    LoggerFactory.INST.logLevel(logLevel ? logLevel : 'none');
    const options = destPath
        ? getWarpCacheOptions(destPath)
        : { ...defaultCacheOptions, inMemory: true };
    return WarpFactory.forMainnet({ ...options });
};

export async function getRepo(id: string, destpath?: string) {
    let pl = getWarp(destpath).contract(CONTRACT_TXID);

    await pl
        .syncState('https://dre-1.warp.cc/contract', { validity: true })
        .catch((err: any) => console.log('DRE Sync Error: ', err?.message));

    // let warp throw error if it can't retrieve the repository
    const response = await pl.viewState({
        function: 'getRepository',
        payload: {
            id,
        },
    });
    return response.result as Repo;
}
