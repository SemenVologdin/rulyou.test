import fs from 'fs';
import xml2js from 'xml2js';
import iconv from 'iconv-lite';
import path from "path";
import admZip from "adm-zip"


export default class Parser {

    #provider = null

    constructor(provider) {
        this.#provider = provider
    }

    async getData() {
        /*
        * Главный метод для получения данных
        */
        const filePath = path.resolve('./downloads/', `${Date.now()}.rar`)
        if( !this.#provider ){
            throw new Error("Не передан провайдер в метод Parser.getData");
        }

        await this.#provider.getData(filePath);

        const xmlData = await this.#unpackArch(filePath);
        const jsonData = await this.#getJsonData(xmlData);

        return this.#getParsedData(jsonData);
    }

    async #unpackArch(filePath) {
        /*
        * Метод для распаковки архива
        */
        const zip = new admZip(filePath);
        const zipEntries = zip.getEntries();

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(err)
            }
        })

        return iconv.decode(zipEntries[0].getData(), 'win1251')
    }

    async #getJsonData(decodedData) {
        /*
        * Метод возвращает данные в формате json
        */
        return new xml2js.Parser()
            .parseStringPromise(decodedData);
    }

    async #getParsedData(jsonData) {
        /*
        * Метод возвращает полученные данные в необходимом формате
        */
        const bics = jsonData?.['ED807']?.['BICDirectoryEntry']

        const result = [];
        for (let elem of bics) {
            const name = elem?.['ParticipantInfo']?.[0]?.['$']?.['NameP'];
            const bic = elem['$']['BIC']

            if (!Array.isArray(elem?.['Accounts'])) {
                continue;
            }

            for (let acc of elem?.['Accounts']) {
                let corrAccount = acc['$']['Account']

                result.push({bic, name, corrAccount})
            }
        }

        return result;
    }
}