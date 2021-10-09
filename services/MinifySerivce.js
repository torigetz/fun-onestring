
import { FilesystemService } from "./FilesystemService.js";
import * as path from 'path';
import * as appRootDir from 'app-root-dir';
import { minify as compress } from 'uglify-js';

export class MinifyService {
    _filename = '';

    constructor (name) {
        if (name) this._filename = `${name}.js`;
    }

    compile (code = '') {
        let uncompressed = code;

        if (this._filename) {
            const scriptsDirectory = path.join(appRootDir.get(), 'src');
            const fs = new FilesystemService(scriptsDirectory);

            uncompressed = fs.read(this._filename);
        }

        let compressed = compress(uncompressed, { mangle: true }).code || 'null';

        return compressed;
    }
}
