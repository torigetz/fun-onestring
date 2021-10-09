
export class LoggerService {
    _name;

    constructor (name = 'logger') {
        this._name = name;
    }

    write (msg) {
        console.log(`[${this._name}] ${msg}`);
    }
}
