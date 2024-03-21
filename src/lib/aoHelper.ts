import { AOS_PROCESS_ID } from './common';
import { dryrun } from '@permaweb/aoconnect';
import type { Tag } from 'arweave/node/lib/transaction';
import type { Repo } from '../types';

function getTags(payload: { [key: string]: string }): Tag[] {
    return Object.entries(payload).map(
        ([key, value]) => ({ name: key, value } as Tag)
    );
}

export async function getRepo(id: string) {
    const { Messages } = await dryrun({
        process: AOS_PROCESS_ID,
        tags: getTags({
            Action: 'Get-Repo',
            Id: id,
            Fields: JSON.stringify([
                'id',
                'name',
                'description',
                'owner',
                'fork',
                'parent',
                'dataTxId',
                'contributors',
                'githubSync',
                'private',
                'privateStateTxId',
            ]),
        }),
    });

    if (Messages.length === 0) return undefined;

    return JSON.parse(Messages[0].Data)?.result as Repo;
}
