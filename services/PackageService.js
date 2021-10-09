
import { FilesystemService } from "./FilesystemService.js";

export class PackageService {
    static getValue (key) {
        const fs = new FilesystemService();
        
        let content = fs.read('package.json');
        let parsed = JSON.parse(content);

        const value = parsed[key];

        if (!value) {
            throw new error(`"${key}" not found in package.json`)
        }

        return value;
    }
}
