//generate uuid.language and return unique file path
import fs from "fs";
import path from "path";
import { v4 as uuid } from 'uuid';

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const codesDirectoryPath=path.join(__dirname, "codes");
if(!fs.existsSync(codesDirectoryPath)){
    fs.mkdirSync(codesDirectoryPath, {recursive:true});
}
console.log(codesDirectoryPath);
export default (language, code)=>{
    const filePath=path.join(codesDirectoryPath, `${uuid()}.${language}`);
    //users...../codes/randomuuid.cpp
    fs.writeFileSync(filePath, code);
    return filePath;
}