import crypto from 'crypto';
import type { PrivateState } from '../types';
import { getActivePublicKey, initArweave } from './arweaveHelper';
import { getWallet, log } from './common';

const arweave = initArweave();

async function deriveAddress(publicKey: string) {
    const pubKeyBuf = arweave.utils.b64UrlToBuffer(publicKey);
    const sha512DigestBuf = await crypto.subtle.digest('SHA-512', pubKeyBuf);

    return arweave.utils.bufferTob64Url(new Uint8Array(sha512DigestBuf));
}

async function decryptAesKeyWithPrivateKey(encryptedAesKey: Uint8Array) {
    const privateKey = getWallet();
    const key = await crypto.subtle.importKey(
        'jwk',
        privateKey,
        {
            name: 'RSA-OAEP',
            hash: 'SHA-256',
        },
        false,
        ['decrypt']
    );

    const options = {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
    };

    const decryptedAesKey = await crypto.subtle.decrypt(
        options,
        key,
        encryptedAesKey
    );

    return new Uint8Array(decryptedAesKey);
}

async function decryptFileWithAesGcm(
    encryptedFile: ArrayBuffer,
    decryptedAesKey: ArrayBuffer,
    iv: Uint8Array
) {
    const aesKey = await crypto.subtle.importKey(
        'raw',
        decryptedAesKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['decrypt']
    );

    const decryptedFile = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        aesKey,
        encryptedFile
    );

    return decryptedFile;
}

export async function decryptRepo(
    repoArrayBuf: ArrayBuffer,
    privateStateTxId: string
): Promise<ArrayBuffer> {
    const response = await fetch(`https://arweave.net/${privateStateTxId}`);
    const privateState = (await response.json()) as PrivateState;

    const ivArrBuff = arweave.utils.b64UrlToBuffer(privateState.iv);

    //public key -> hash -> get the aes key from object
    const pubKey = getActivePublicKey();
    const address = await deriveAddress(pubKey);

    const encAesKeyStr = privateState.encKeys[address]!;
    const encAesKeyBuf = arweave.utils.b64UrlToBuffer(encAesKeyStr);

    const aesKey = (await decryptAesKeyWithPrivateKey(
        encAesKeyBuf
    )) as unknown as ArrayBuffer;
    const decryptedRepo = await decryptFileWithAesGcm(
        repoArrayBuf,
        aesKey,
        ivArrBuff
    );

    return decryptedRepo;
}
