import express from "express";
import cors from 'cors';
import generateCodeFile from "./generateCodeFile.js";
import generateInputFile from "./generateInputFile.js";
import runcpp from "./utilities/runcpp.js";
import runpython from "./utilities/runpython.js";
import runjava from "./utilities/runjava.js";
import decommentCode from "./utilities/ai/decommentCode.js"
import reformatCode from "./utilities/ai/reformatCode.js"
import submitcpp from "./utilities/submit/submitcpp.js";
import submitc from "./utilities/submit/submitc.js";
import submitpy from "./utilities/submit/submitpy.js";
import submitjava from "./utilities/submit/submitjava.js";

const app=express();
// basic cors config
// app.use(cors({
//     origin: "http://localhost:3000",
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
// }));
app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use(express.json());


app.get("/", (req, res)=>{
    res.json({hi:"hi"});
});
app.post("/run", async (req, res)=>{
    // get lang, code, input from json object sent in post request
    const {language="cpp", code, input=""}=req.body;
    if(!code)   res.status(400).json({"success":false, error:"Empty code sent!"});
    try {
        const codeFilePath=generateCodeFile(language, code);
        const inputPath=generateInputFile(input);
        let result;
        switch(language){
            case "cpp":
                result=await runcpp(codeFilePath, inputPath, input);
                break;
            case "c":
                result=await runc(codeFilePath, inputPath, input);
                break;
            case "py":
                result=await runpython(codeFilePath, inputPath, input);
                break;
            case "java":
                result=await runjava(codeFilePath, inputPath, input);
                break;
            default:
                res.status(400).json({"success":false, error:"Invalid language!"});
        }
        const {stdout, executionTime}=result;
        res.status(200).json({
            success:true, 
            // filePath, 
            // inputPath, 
            stdout,
            executionTime
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            error:error.stderr || error.error
        })
    }
})
app.post("/submit", async (req, res)=>{
    const {code, language, testCases}=req.body;
    console.log(code, language, testCases);
    if(!code)  return res.status(400).json({"success":false, error:"Empty code sent!"});
    if(!language)   return res.status(400).json({"success":false, error:"Empty language sent!"});
    if(!testCases)   return res.status(400).json({"success":false, error:"Empty testcases sent!"});
    const codeFilePath=generateCodeFile(language, code);
    const totalTime=performance.now();
    let submitResult;
    switch(language){
        case "cpp":
            submitResult = await submitcpp(codeFilePath, testCases); break;
        case "c":
            submitResult = await submitc(codeFilePath, testCases); break;
        case "py":
            submitResult = await submitpy(codeFilePath, testCases); break;
        case "java":
            submitResult = await submitjava(codeFilePath, testCases); break;
        default: res.status(400).json({"success":false, error:"Invalid language!"});
    }
    const {compilationSuccess, executionSuccess, verdict} = submitResult;
    res.status(200).json({
        compilationSuccess:compilationSuccess?compilationSuccess:executionSuccess,
        verdict,
        totalTime:performance.now()-totalTime
    });
})
app.post("/decomment", async (req, res)=>{
    const {code, language=""}=req.body;
    try{
        const aiResponse = await decommentCode(code, language);
        res.json({success:true, aiResponse});
    }catch(error){
        res.status(500).json({success:false, error:error.message});
    }
})
app.post("/reformat", async (req, res)=>{
    const {code, language=""}=req.body;
    try{
        const aiResponse = await reformatCode(code, language);
        res.json({success:true, aiResponse});
    }catch(error){
        res.status(500).json({success:false, error:error.message});
    }
})
const PORT=process.env.PORT || 8000;
app.listen(process.env.PORT, ()=>{
    console.log(`compiler server listening on tcp port ${PORT}.`);
})