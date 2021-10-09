
import { PackageService } from "../services/PackageService.js";
import { LoggerService } from "../services/LoggerService.js";
import { DevServerService } from "../services/DevServerService.js";
import * as dotenv from 'dotenv';

dotenv.config();

const appName = PackageService.getValue('name');
const log = new LoggerService(appName);

const onRequest = ({ method, url }) => log.write(`${method} ${url}`);

const onStart = (port) => log.write(`dev server started at ${port} port`);

const main = () => {
    log.write('dev server starts...');

    const server = new DevServerService({ onRequest, onStart });

    server.start();
}

main();