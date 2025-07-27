import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react';
import axios from "axios";
import { useParams } from "react-router-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Link } from "react-router-dom";

axios.defaults.withCredentials = true;
const backendUrl = import.meta.env.VITE_BACKEND_URL;
// let run_url=`http://localhost:3000/problems/${problemId}/run`;
// let submit_url=`http://localhost:3000/problems/${problemId}/submit`;
// let reformat_url=`http://localhost:3000/problems/${problemId}/reformat`;
// let decomment_url=`http://localhost:3000/problems/${problemId}/decomment`;
// let problem_url=`http://localhost:3000/problems/${problemId}`;

let run_url, submit_url, reformat_url, decomment_url, problem_url;

export default function Problem() {
    const {problemId} = useParams();
    run_url=`${backendUrl}/problems/${problemId}/run`;
    submit_url=`${backendUrl}/problems/${problemId}/submit`;
    reformat_url=`${backendUrl}/problems/${problemId}/reformat`;
    decomment_url=`${backendUrl}/problems/${problemId}/decomment`;
    problem_url=`${backendUrl}/problems/${problemId}`;
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [language, setLanguage] = useState("cpp");
  const originalCode = {cpp:getBoilerplate("cpp"), c:getBoilerplate("c"), py:getBoilerplate("py"), java:getBoilerplate("java")};
  const [code, setCode] = useState(originalCode);
  const [output, setOutput] = useState("No output yet");
  const [submission, setSubmission] = useState(null);
  const [input, setInput] = useState("");
  const originalMonacoOptions = {fontSize:16, theme:"vs", lineNumbers:"on", wordWrap:"on"};
  const [monacoOptions, setMonacoOptions] = useState({...originalMonacoOptions, theme: "vs-dark"});
  const editorRef = useRef(null);

  function handleEditorChange(value, event){
    setCode(prev=>({...prev, [language]:value}));
  }
  function decomment(code, language, setCode){
    setIsLoadingAI(true);
    axios.post(decomment_url, {code, language})
      .then(response => {
        setCode(prev=>({...prev, [language]:response.data.aiResponse}));
        setIsLoadingAI(false);
      })
      .catch(error => {
        console.error("Error communicating with decomment API:", error);
        setIsLoadingAI(false);
      });
  }
  function reformat(code, language, setCode){
    setIsLoadingAI(true);
    axios.post(reformat_url, {code, language})
      .then(response => {
        setCode(prev=>({...prev, [language]:response.data.aiResponse}));
        setIsLoadingAI(false);
      })
      .catch(error => {
        console.error("Error communicating with reformat API:", error);
        setIsLoadingAI(false);
      });
  }
  useEffect(() => {
  if (editorRef.current) {
    const model = editorRef.current.getModel();
    if (model) {
      model.setValue(code[language] || "");
      model.pushStackElement();
    }
  }
}, [language]);


async function run(code, language="cpp", input=""){
    setIsLoading(true);
    setOutput("Running code...");
    const payload={code, language, input}
    try{
      let runResult = await axios.post(run_url, payload);
      console.log(runResult.data);
      const data = runResult.data;
      if (typeof data === 'string' && data) {
        setOutput(data);
      } else if (data && (data.stdout || data.stderr)) {
        setOutput(data.stdout || data.stderr);
      } else if (data && typeof data.stdout === 'string') {
        setOutput("[No output on stdout]");
      }
      else {
        setOutput("Execution finished, but no output was produced.");
      }
    }catch(err){
      if(err.response){
        setOutput(err.response.data?.error || err.response.data?.message || "An unknown error occurred");
      }else{
        setOutput("Error communicating with the compiler server.");
      }
    }finally{
      setIsLoading(false);
    }
  }
  async function submit(code, language="cpp"){
    setIsLoading(true);
    const payload={code, language};
    try {
      let submitResult = await axios.post(submit_url, payload);
      setSubmission(submitResult.data);
      console.log(submitResult.data);
    } catch (error) {
      if(error?.response){
        setSubmission(error.response.data);
      }else{
        setSubmission("Error communicating with the submission server.");
      }
    }finally{
      setIsLoading(false);
    }
  }

  const [height, setHeight] = useState(window.innerHeight-100);
  useEffect(()=>{
    setHeight(window.innerHeight-100);
  },[window.innerHeight]);
  return(
    // using height as a state variable to make the panel group responsive
    <div className='p-4 bg-gray-900 text-white h-screen font-sans overflow-y-auto'>
    <PanelGroup direction="horizontal" className='h-fit'>
      <Panel defaultSize={40} minSize={20} maxSize={80} className='overflow-y-auto h-fit'>
          <ProblemPane />
      </Panel>
      <PanelResizeHandle className="h-full w-2.5 mx-2 bg-gray-700 cursor-col-resize flex items-center justify-center z-10 transition-colors duration-200 rounded-full border-l border-r border-gray-600 hover:bg-blue-500">
        <div className="w-1 h-8 bg-gray-500 rounded-full" />
      </PanelResizeHandle>
      <Panel defaultSize={60} minSize={20} maxSize={80}>
        <div style={{overflowY:"auto"}} className='h-full'>
          <div className="flex flex-row items-center gap-4 mb-4 p-2 bg-gray-800 rounded-lg">
            <select value={language} onChange={e=>{
              setLanguage(e.target.value);
              }} className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
              <option value="cpp">C++</option><option value="c">C</option><option value="py">Python</option><option value="java">Java</option>
            </select>
            <button onClick={()=>decomment(code[language], language, setCode)} disabled={isLoadingAI} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1.5 px-3 rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">De-Comment AI</button>
            <button onClick={()=>reformat(code[language], language, setCode)} disabled={isLoadingAI} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1.5 px-3 rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Reformat AI</button>
            <div className="flex-grow"></div>
            <EditorOptions monacoOptions={monacoOptions} setMonacoOptions={setMonacoOptions} originalMonacoOptions={originalMonacoOptions}/>
          </div>
          <PanelGroup direction="vertical">
            <Panel defaultSize={50} minSize={20} maxSize={80}>
              {/* <div className="h-full w-full rounded-lg overflow-hidden"> */}
                <Editor theme={monacoOptions.theme} options={monacoOptions} value={code[language]} defaultLanguage={language} defaultValue={code[language]} onChange={(value, event)=>handleEditorChange(value, event)}
                      onMount={(editor, monaco) => {editorRef.current = editor; editorRef.current.focus();}}
                    />
              {/* </div> */}
            </Panel>
            <PanelResizeHandle className="h-2.5 my-1 bg-gray-700 cursor-row-resize flex items-center justify-center z-10 transition-colors duration-200 rounded-full border-t border-b border-gray-600 hover:bg-blue-500">
              <div className="w-8 h-1 bg-gray-500 rounded-full" />
            </PanelResizeHandle>
            <Panel defaultSize={15} minSize={10} maxSize={80}>
                  <PanelGroup direction="horizontal">
                    <Panel defaultSize={50} minSize={20}>
                        <div className="h-full flex flex-col px-1">
                            <h3 className="text-lg font-semibold mb-2 flex-shrink-0">Input</h3>
                            <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder='Enter Input (optional)' className="flex-grow w-full bg-gray-800 border border-gray-600 rounded-md p-2.5 font-mono text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"></textarea>
                        </div>
                    </Panel>
                    <PanelResizeHandle className="w-2.5 mx-2 bg-gray-700 cursor-col-resize flex items-center justify-center z-10 transition-colors duration-200 rounded-full border-l border-r border-gray-600 hover:bg-blue-500">
                        <div className="w-1 h-8 bg-gray-500 rounded-full" />
                    </PanelResizeHandle>
                    <Panel defaultSize={50} minSize={20}>
                        <Output output={output}/>
                    </Panel>
                  </PanelGroup>
            </Panel>
            <PanelResizeHandle className="h-2.5 my-2 bg-gray-700 cursor-row-resize flex items-center justify-center z-10 transition-colors duration-200 rounded-full border-t border-b border-gray-600 hover:bg-blue-500">
              <div className="w-8 h-1 bg-gray-500 rounded-full" />
            </PanelResizeHandle>
            <Panel defaultSize={35} minSize={10} maxSize={80}>
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-4 p-2 flex-shrink-0">
                  <button type="button" disabled={isLoading} onClick={()=>run(code[language], language, input)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Run</button>
                  <button type="button" disabled={isLoading} onClick={()=>submit(code[language], language)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Submit</button>
                </div>
                <div className="flex-grow overflow-y-shown px-1">
                  <Result submission={submission}/>
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </Panel>
    </PanelGroup>
    </div>
  )
}


function EditorOptions({monacoOptions, setMonacoOptions, originalMonacoOptions}){
  return(
    <div className='text-lg flex flex-row items-center justify-center gap-2'>
      <button title="Reset" onClick={()=>setMonacoOptions(originalMonacoOptions)} className="bg-gray-700 hover:bg-gray-600 rounded-md p-1.5 transition-colors active:scale-95">
        🔄
      </button>
      <button title="Toggle Theme" onClick={()=>setMonacoOptions({...monacoOptions, theme:monacoOptions.theme==="vs"?"vs-dark":"vs"})} className="bg-gray-700 hover:bg-gray-600 rounded-md p-1.5 transition-colors active:scale-95">
        🌓
      </button>
      <button title="Increase Font Size" onClick={()=>setMonacoOptions({...monacoOptions, fontSize:monacoOptions.fontSize+1})} className="bg-gray-700 hover:bg-gray-600 rounded-md p-1.5 transition-colors active:scale-95">
        <span className="font-bold text-sm">A+</span>
      </button>
      <button title="Decrease Font Size" onClick={()=>setMonacoOptions({...monacoOptions, fontSize:monacoOptions.fontSize-1})} className="bg-gray-700 hover:bg-gray-600 rounded-md p-1.5 transition-colors active:scale-95">
        <span className="font-bold text-sm">A-</span>
      </button>
      <button title="Toggle Line Numbers" onClick={()=>setMonacoOptions({...monacoOptions, lineNumbers:monacoOptions.lineNumbers==="on"?"off":"on"})} className="bg-gray-700 hover:bg-gray-600 rounded-md p-1.5 transition-colors active:scale-95">
        🔢
      </button>
      <button title="Toggle Word Wrap" onClick={()=>setMonacoOptions({...monacoOptions, wordWrap:monacoOptions.wordWrap==="on"?"off":"on"})} className="bg-gray-700 hover:bg-gray-600 rounded-md p-1.5 transition-colors active:scale-95">
        ↩️
      </button>
    </div>
  )
}
function ProblemPane(){
  const [problem, setProblem] = useState(null);
  const [loadingError, setLoadingError] = useState(false);
  useEffect(()=>{
    axios.get(problem_url)
      .then(response=>{
        console.log(response.data);
        setProblem(response.data);
      }).catch(error=>{
        console.error("Error fetching problem:", error);
        setLoadingError(true);
      });
  },[]);
  if(!problem) return <div className="flex items-center justify-center h-full text-gray-400">{loadingError?"Error loading problem":"Loading..."}</div>;
  const {title, statement, examples=[], inputFormat="", outputFormat="", difficulty=""} = problem;
  const difficultyStyles = {
    easy: "bg-green-800 text-green-300",
    medium: "bg-yellow-800 text-yellow-300",
    hard: "bg-red-800 text-red-300",
  };
  return(
    <div className="p-6 bg-gray-800 rounded-lg h-full overflow-y-auto">
    {problem && <div>
      <div className="flex flex-row gap-4 items-center mb-4">
        <h1 className='text-3xl font-bold text-blue-400'>{title}</h1>
        {
          difficulty && <div className={`px-2 py-1 rounded-full text-xs font-semibold w-fit ${difficultyStyles[difficulty.toLowerCase()]}`}>{difficulty.toUpperCase()}</div>
        }
        {/* my submissions button */}
        <Link to={`/submissions/${problem.id}`} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded-md transition-colors">My Submissions</Link>
      </div>
      <h3 className='text-xl font-semibold mt-6 mb-2 text-gray-300'>Statement</h3>
      <p className="text-gray-400 leading-relaxed">{statement}</p>
      {inputFormat && <><h3 className='text-xl font-semibold mt-6 mb-2 text-gray-300'>Input Format</h3>
      <p className="text-gray-400 leading-relaxed">{inputFormat}</p></>}
      {outputFormat && <><h3 className='text-xl font-semibold mt-6 mb-2 text-gray-300'>Output Format</h3>
      <p className="text-gray-400 leading-relaxed">{outputFormat}</p></>}
      <h3 className='text-xl font-semibold mt-6 mb-2 text-gray-300'>Examples</h3>
        {examples.map((example, index)=>(
        <div key={index} className='bg-gray-900/50 p-4 rounded-lg mt-3 border border-gray-700'>
          <p className="font-semibold text-gray-300">Input:</p>
          <pre className="bg-gray-900 p-2 rounded-md mt-1 mb-2 text-gray-300 font-mono text-sm">{example.input}</pre>
          <p className="font-semibold text-gray-300">Output:</p>
          <pre className="bg-gray-900 p-2 rounded-md mt-1 mb-2 text-gray-300 font-mono text-sm">{example.output}</pre>
          {example.explanation && <>
            <p className="font-semibold text-gray-300">Explanation:</p>
            <p className="text-gray-400 leading-relaxed mt-1">{example.explanation}</p>
          </>}
        </div>
      ))}
            </div>}
    </div>
  )
}
function Output({output}){
  return(
    <div className="h-full flex flex-col">
    <h3 className='text-lg font-semibold mb-2'>Output</h3>
    <div className="flex-grow w-full bg-gray-800 p-4 rounded-md font-mono text-sm whitespace-pre-wrap overflow-y-auto border border-gray-600">
      {output}
    </div>
    </div>
  )
}
function Result({submission}){
  if(!submission) return <div className="p-4 bg-gray-800 rounded-lg text-gray-400">Submit your code to see the verdict.</div>
  if(submission.code=="ERR_BAD_REQUEST"){
    return <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300">Error: {submission.message}</div>
  }
  if(submission.compilationSuccess==false){
    return <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300">Compilation Error</div>
  }
  if(submission.verdict?.length==0){
    return <div className="p-4 bg-gray-800 rounded-lg text-gray-400">Running test cases...</div>
  }
  if(submission.verdict==undefined){
    return <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300">Error: {submission.message}</div>
  }
  try{
    const allPassed = submission.verdict.every(v => v.success);
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className={`text-xl font-bold mb-3 ${allPassed ? 'text-green-400' : 'text-red-400'}`}>
          {allPassed ? 'Accepted' : 'Wrong Answer'}
        </h3>
        <div className="flex flex-row gap-2 flex-wrap">
          {submission.verdict.map((testCaseResult, index)=>(
            <div key={index} className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${testCaseResult.success?"bg-green-500/20 text-green-300":"bg-red-500/20 text-red-300"}`}>
              <span>Test Case {testCaseResult.testCaseId}</span>
              <span className="font-normal">{testCaseResult.success?"Passed":testCaseResult.error?testCaseResult.error:"Failed"}</span>
            </div>
          ))}
        </div>
      </div>
    )
    
  }catch(error){
    console.error("Error fetching submission results:", error);
    return <div>Error fetching submission results</div>
  }
}

function getBoilerplate(language){
  switch(language){
    case "cpp":
      return `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`;
    case "py":
      return `print("Hello, World!")`;
    case "c":
      return `#include <stdio.h>
int main() {
    printf("Hello, World!\\n");
    return 0;
}`;
    case "java":
      return `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`;
    default:
      return `// boilerplate code for ${language}`;
  }
}