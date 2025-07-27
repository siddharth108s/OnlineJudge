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
    let executionSuccess=true;
    const verdict=[];
    try{
        const t = typeof testCases === "string" ? JSON.parse(testCases) : testCases;
        for(const testcase of t){
            const {id, input, output, timeLimit=1000}=testcase;
            const ExecutionCommand=`echo ${input} | python ${codeFilePath}`;
            const result= await new Promise((resolve, reject)=>{
                const timeOutTLE = setTimeout(()=>{controller.abort();}, timeLimit);
                exec(ExecutionCommand, {signal}, (error, stdout, stderr)=>{
                    if(stderr){executionSuccess=false;console.log(stderr);return resolve({testCaseId: id, success:false, stderr});}
                    if(error){
                        executionSuccess=false;
                        console.log(error);
                        if(error.code=="ABORT_ERR"){
                            return resolve({testCaseId: id, success:false, error:"Time Limit Exceeded"});
                        }
                        if(error.code=="ERR_CHILD_PROCESS_STDIO_MAXBUFFER"){
                            return resolve({testCaseId: id, success:false, error:"Maximum output size exceeded"});
                        }
                        return resolve({testCaseId: id, success:false, error});
                    }
                    if(stdout?.trim()==output?.trim())   resolve({testCaseId: id, success:true});
                    else    resolve({testCaseId: id, success:false, error:"Wrong Answer"});
                    clearTimeout(timeOutTLE);
                })
            })
            verdict.push(result);
        }
        return {executionSuccess, verdict};
    }catch(e){
        console.log(e);
        executionSuccess=false;
        return {executionSuccess, verdict};
    }
}
