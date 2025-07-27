//compile once
//for each input,output object, run against input and compare against output
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
export default async (codeFilePath, testCases, globalTimeLimit=5000)=>{
    const controller = new AbortController();
    const { signal } = controller;
    // const timeOutTLE = setTimeout(()=>{
    //     controller.abort();
    // }, globalTimeLimit);

    let compilationSuccess=false;
    const verdict=[];
    const outputFilePath=path.join(outputsDirectoryPath, path.basename(codeFilePath).split(".")[0]);
    const CompilationCommand=`g++ ${codeFilePath} -o ${outputFilePath}.exe`;
    //run compilation command using exec
    return new Promise((resolve, reject)=>{
    exec(CompilationCommand, {signal}, async (error, stdout, stderr)=>{
        if(stderr){console.log(stderr); compilationSuccess=false; return resolve({compilationSuccess, verdict});}
        if(error){console.log(error); compilationSuccess=false; return resolve({compilationSuccess, verdict});}
        compilationSuccess=true;
        try{
            const t = typeof testCases === "string" ? JSON.parse(testCases) : testCases;
            for(const testcase of t){
                // console.log(testcase);
                const {id, input, output, timeLimit=100}=testcase;
                const ExecutionCommand=`echo ${input} | ${outputFilePath}.exe`;
                const result= await new Promise((resolve, reject)=>{
                    const timeOutTLE = setTimeout(()=>{controller.abort();}, timeLimit);
                    exec(ExecutionCommand, {signal}, (error, stdout, stderr)=>{
                        if(stderr){console.log(stderr);return resolve({testCaseId: id, success:false, stderr});}
                        if(error){
                            console.log(error);
                            if(error.code=="ABORT_ERR"){
                                return resolve({testCaseId: id, success:false, error:"Time Limit Exceeded"});
                            }
                            if(error.code=="ERR_CHILD_PROCESS_STDIO_MAXBUFFER"){
                                return resolve({testCaseId: id, success:false, error:"Maximum output size exceeded"});
                            }
                            return resolve({testCaseId: id, success:false, error});
                        }
                        // console.log(`input: ${input}\noutput: ${output}\nstdout: ${stdout}`);
                        if(stdout?.trim()==output?.trim())   resolve({testCaseId: id, success:true});
                        else    resolve({testCaseId: id, success:false, error:"Wrong Answer"});
                        clearTimeout(timeOutTLE);
                    })
                })
                verdict.push(result);
            }
            resolve({compilationSuccess, verdict});
        }catch(e){
            console.log(e);
            compilationSuccess=false;
            resolve({compilationSuccess, verdict});return;
        }
        })
    })
}