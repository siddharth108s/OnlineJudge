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
export default (codeFilePath, inputFilePath, input="", timeLimit=2000, memoryLimit=1024)=>{
    const controller = new AbortController();
    const { signal } = controller;
    const outputFilePath=path.join(outputsDirectoryPath, path.basename(codeFilePath).split(".")[0]);
    const command=`g++ ${codeFilePath} -o ${outputFilePath}.exe && ${outputFilePath}.exe < ${inputFilePath}`;
    //command without using input file and sending input as a string
    // const command=`g++ ${codeFilePath} -o ${outputFilePath}.exe && echo ${input} | ${outputFilePath}.exe`;
    let executionTime=performance.now();
    return new Promise((resolve, reject)=>{
        const timeOutTLE = setTimeout(()=>{
            // console.log("Time Limit Exceeded");
            // isTLE=true;
            // controller.abort();
            // console.log("Time Limit Exceeded");
            // reject({error:"Time Limit Exceeded"});
            controller.abort();
            // return;
        }, timeLimit);
        exec(command, {signal}, (error, stdout, stderr)=>{
            if(stderr){
                console.log(stderr);
                return reject({stderr})
            };
            if(error){
                // if(isTLE){
                //     return reject({error:"Time Limit Exceeded"});
                // }
                if(error.code=="ABORT_ERR"){
                    return reject({error:"Time Limit Exceeded"});
                }
                if(error.code=="ERR_CHILD_PROCESS_STDIO_MAXBUFFER"){
                    return reject({error:"Maximum output size exceeded"});
                }
                return reject({error})
            };
            // console.log(stdout);
            executionTime=performance.now()-executionTime;
            clearTimeout(timeOutTLE);
            resolve({stdout, executionTime});
        })
    })
}