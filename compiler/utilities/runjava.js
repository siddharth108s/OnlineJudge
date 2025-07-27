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
export default (codeFilePath, inputFilePath, input="", timeLimit=2000)=>{
    const controller = new AbortController();
    const { signal } = controller;
    // const command=`java ${codeFilePath} < ${inputFilePath}`;
    const command=`echo ${input} | java ${codeFilePath}`;
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
        const process=exec(command, {signal}, (error, stdout, stderr)=>{
            // if(error){console.log(error);reject({error, stderr})};
            // if(error){console.log(stderr);reject({stderr})};
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
                    controller.abort();
                    return reject({error:"Maximum output size exceeded"});
                }
                return reject({error})
            };

            clearTimeout(timeOutTLE);
            // console.log(stdout);
            executionTime=performance.now()-executionTime;
            return resolve({stdout, executionTime});
        })
    })
}