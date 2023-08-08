import fetch from "node-fetch";
import fs from 'fs';
import {Readable} from 'stream';
import {finished} from 'stream/promises';

export default class HTTPProvider {
    #url = ""

    constructor(url) {
        this.#url = url
    }

    async getData(filePath) {
        /*
        * Метод для отправки запроса на сервер, и сохранения файла по пути
        */
        if( !this.#url ){
            throw new Error("URL не передан в метод HTTPProvider.getData!")
        }
        const res = await fetch(this.#url);

        if (!fs.existsSync('./downloads')) {
            fs.mkdirSync('./downloads');
        }

        const fileStream = fs.createWriteStream(filePath, {flags: 'wx'});
        await finished(Readable.from(res.body).pipe(fileStream));

        return filePath;
    }
}