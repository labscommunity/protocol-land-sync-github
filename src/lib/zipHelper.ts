import { promises as fsPromises } from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { waitFor } from './common';

export type UnpackGitRepoOptions = {
    destPath: string;
    arrayBuffer: ArrayBuffer;
};

export async function unpackGitRepo({
    destPath,
    arrayBuffer,
}: UnpackGitRepoOptions) {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const promises: any[] = [];

    for (const [_, file] of Object.entries(zip.files)) {
        if (file.dir) {
            const folderPath = path.join(destPath, file.name);
            promises.push(fsPromises.mkdir(folderPath, { recursive: true }));
        } else {
            promises.push(
                (async () => {
                    const filePath = path.join(destPath, file.name);

                    // Ensure the directory for the file exists
                    const dirPath = path.dirname(filePath);
                    await fsPromises.mkdir(dirPath, { recursive: true });

                    const content = await file.async('nodebuffer');
                    fsPromises.writeFile(filePath, content);
                })()
            );
        }
    }

    await Promise.all(promises);

    await waitFor(1000);

    return true;
}
