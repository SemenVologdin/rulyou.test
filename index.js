import Parser from "./src/Parser.js";
import HTTPProvider from "./src/HTTPProvider.js";


const URL = 'http://www.cbr.ru/s/newbik';

const dataProvider = new HTTPProvider(URL)
const parser = new Parser(dataProvider)

parser.getData()
    .then(console.log)
