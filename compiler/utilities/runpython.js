import { exec } from "child_process";

export default (codeFilePath, inputFilePath, input="", timeLimit=2000)=>{

    const controller = new AbortController();
    const { signal } = controller;
    let executionSuccess=false;
    // const command=`python ${codeFilePath} < ${inputFilePath}`;
    const command=`echo ${input} | python ${codeFilePath}`;
    let executionTime=performance.now();
    return new Promise((resolve, reject)=>{
        const timeOutTLE = setTimeout(()=>{controller.abort();}, timeLimit);
        exec(command, {signal}, (error, stdout, stderr)=>{
            if(stderr){
                console.log(stderr);
                executionSuccess=false;
                return reject({stderr, executionSuccess})
            };
            if(error){
                if(error.code=="ABORT_ERR"){
                    executionSuccess=false;
                    return reject({error:"Time Limit Exceeded", executionSuccess});
                }
                if(error.code=="ERR_CHILD_PROCESS_STDIO_MAXBUFFER"){
                    executionSuccess=false;
                    return reject({error:"Maximum output size exceeded", executionSuccess});
                }
                return reject({error, executionSuccess})
            };
            executionTime=performance.now()-executionTime;
            clearTimeout(timeOutTLE);
            executionSuccess=true;
            resolve({stdout, executionTime, executionSuccess});
        })
    })
}
// original code without tle and other errors
// import { exec } from "child_process";

// export default (codeFilePath, inputFilePath, input="", timeLimit=2000)=>{

//     const controller = new AbortController();
//     const { signal } = controller;

//     // const command=`python ${codeFilePath} < ${inputFilePath}`;
//     const command=`echo ${input} | python ${codeFilePath}`;
//     let executionTime=performance.now();
//     return new Promise((resolve, reject)=>{
//         const timeOutTLE = setTimeout(()=>{
//             controller.abort();
//         }, timeLimit);
//         exec(command, (error, stdout, stderr)=>{
//             if(error){console.log(error);reject({error, stderr})};
//             if(error){console.log(stderr);reject({stderr})};
//             // console.log(stdout);
//             executionTime=performance.now()-executionTime;
//             resolve({stdout, executionTime});
//         })
//     })
// }