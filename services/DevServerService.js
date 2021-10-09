
import express from 'express';
import * as appRootDir from 'app-root-dir';
import * as path from 'path';
import bodyParser from 'body-parser';
import { FilesystemService } from './FilesystemService.js';
import { MinifyService } from './MinifySerivce.js';

const DEFAULT_PORT = 80;
const INDEX_DIRECTORY = path.join(appRootDir.get(), 'public', 'index.html');
const STATIC_DIRECTORY = path.join(appRootDir.get(), 'public');

class DevServerController {
    static getIndex (req, res) {
        res.sendFile(INDEX_DIRECTORY);
    }

    static list (req, res) {
        const fs = new FilesystemService();

        const files = fs.dir('src');
        let filtered = [];

        for (let file of files) {
            const filename = file.split('.').slice(0, -1).join('.');
            const ext = file.split('.').pop();

            if (ext === 'js') {
                filtered = [ ...filtered, filename ];
            }
        }

        res.send(filtered);
    }

    static compile (req, res) {        
        const minifier = new MinifyService();

        const compressed = minifier.compile(req.body.code || '');

        res.send({
            code: compressed
        });
    }

    static load (req, res) {
        const { name } = req.query;

        const minifier = new MinifyService(name);

        const result = {
            code: minifier.compile()
        }

        res.send(result);
    }

    static mapRoutes (app) {
        app.get('/', this.getIndex);
        app.get('/list', this.list);
        app.get('/load', this.load)
        app.post('/compile', this.compile)
    }
}

export class DevServerService {
    _port;
    _onRequest;
    _onStart;

    constructor ({ onStart, onRequest }) {
        this._onRequest = onRequest;
        this._onStart = onStart;
        this._port = process.env.PORT || DEFAULT_PORT;
    }

    start () {
        const app = express();

        app.use(bodyParser.json());
        app.use((req, res, next) => {
            this._onRequest(req);
            next();
        });
        app.use('/', express.static(STATIC_DIRECTORY));

        DevServerController.mapRoutes(app);

        app.listen(this._port, () => {
            this._onStart(this._port)
        });
    }
}
