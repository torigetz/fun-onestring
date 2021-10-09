
import * as appRootDir from 'app-root-dir';
import * as path from 'path';
import fs from 'fs-extra';

export class FilesystemService {
    _directory;

    constructor (dir = appRootDir.get()) {
        this._directory = dir;
    }

    _getFilePath (filename) {
        return path.join(this._directory, filename);
    }

    read (filename) {
        const filePath = this._getFilePath(filename);

        if (!fs.existsSync(filePath)) {
            throw new Error(`${filePath} not found!`)
        }

        const content = fs.readFileSync(filePath, 'utf-8');

        return content;
    }

    write (filename, content = '') {
        const filePath = this._getFilePath(filename);

        fs.writeFileSync(filePath, content);
    }
}
