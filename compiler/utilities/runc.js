//run c++ code usign g++ and return output
import fs from "fs";
import path from "path";
import { exec } from "child_process";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const outputsDirectoryPath=path.join(path.dirname(__dirname), "outputs");
if(!fs.existsSync(outputsDirectoryPath)){
    fs.mkdirSync(outputsDirectoryPath, {recursive:true});
}
export default (codeFilePath, inputFilePath, input="")=>{

    const controller = new AbortController();
    const { signal } = controller;

    const outputFilePath=path.join(outputsDirectoryPath, path.basename(codeFilePath).split(".")[0]);
    const command=`gcc ${codeFilePath} -o ${outputFilePath}.exe && ${outputFilePath}.exe < ${inputFilePath}`;
    // const command=`gcc ${codeFilePath} -o ${outputFilePath}.exe && echo ${input} | ${outputFilePath}.exe}`;
    let executionTime=performance.now();
    return new Promise((resolve, reject)=>{
        const timeOutTLE = setTimeout(()=>{controller.abort();}, timeLimit);
        exec(command, {signal}, (error, stdout, stderr)=>{
            if(stderr){
                console.log(stderr);
                return reject({stderr})
            };
            if(error){
                if(error.code=="ABORT_ERR"){
                    return reject({error:"Time Limit Exceeded"});
                }
                if(error.code=="ERR_CHILD_PROCESS_STDIO_MAXBUFFER"){
                    return reject({error:"Maximum output size exceeded"});
                }
                return reject({error})
            };
            executionTime=performance.now()-executionTime;
            clearTimeout(timeOutTLE);
            resolve({stdout, executionTime});
        })
    })
}