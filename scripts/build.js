
import { PackageService } from "../services/PackageService.js";
import { LoggerService } from "../services/LoggerService.js";

const appName = PackageService.getValue('name');
const log = new LoggerService(appName);

const main = () => {
    log.write('build starts...');
}

main();
