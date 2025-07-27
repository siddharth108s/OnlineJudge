//generate uuid.language and return unique file path
import fs from "fs";
import path from "path";
import { v4 as uuid } from 'uuid';

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const inputDirectoryPath=path.join(__dirname, "files");
if(!fs.existsSync(inputDirectoryPath)){
    fs.mkdirSync(inputDirectoryPath, {recursive:true});
}
export default (inputContent)=>{
    const filePath=path.join(inputDirectoryPath, `${uuid()}.txt`);
    //users...../codes/randomuuid.cpp
    fs.writeFileSync(filePath, inputContent);
    return filePath;
}