import express from "express"
import Problem from "../../models/Problem.js";
import jsonData from '../../problems.json' with { type: 'json' };
import axios from "axios";
import Submission from "../../models/Submission.js";
import auth from "../../middleware/auth.js";
const router = express.Router();

// CRUD on problems
router.post('/', auth, async (req, res) => {
  const {id, title, statement, examples=[], inputFormat="", outputFormat="", difficulty="Easy", timeLimit=1000, memoryLimit=1024, testCases=[]} = req.body;
  if(!id || !title || !statement) return res.status(400).json({error: "id, title and statement are required"});
  if(await Problem.findOne({id})) return res.status(400).json({error: "Problem already exists"});
  const newProblem = new Problem({id, title, statement, examples, inputFormat, outputFormat, difficulty, timeLimit, memoryLimit, testCases});
  try{
    await newProblem.save();
    res.json(newProblem);
  }catch(error){
    console.error(error);
    res.status(500).json({error: "Internal server error"});
  }
});
router.put('/:id', auth, async (req, res) => {
  const {id, title, statement, examples=[], inputFormat="", outputFormat="", difficulty="Easy", timeLimit=1000, memoryLimit=1024, testCases=[]} = req.body;
  if(!id || !title || !statement) return res.status(400).json({error: "id, title and statement are required"});
  if(!await Problem.findOne({id})) return res.status(400).json({error: "Problem not found"});
  const updatedProblem = await Problem.findOneAndUpdate({id}, {id, title, statement, examples, inputFormat, outputFormat, difficulty, timeLimit, memoryLimit, testCases}, {new: true});
  res.json(updatedProblem);
});
router.delete('/:id', auth, async (req, res) =>{
  const {id} = req.params;
  if(!await Problem.findOne({id})) return res.status(400).json({error: "Problem not found"});
  await Problem.findOneAndDelete({id});
  res.json({message: "Problem deleted successfully"});
});
// Define user routes
router.get('/', async (req, res) => {
  try {
    const allProblems = await Problem.find({});
    const problems = allProblems.map(problem => ({
      _id: problem._id,
      id: problem.id,
      title: problem.title,
      difficulty: problem.difficulty
    }));
    res.json(allProblems);
  } catch (err) {
    console.error("Error in /problems route:", err);
    res.status(500).json({ error: "Internal server error" });
  }
  
  
  //return all problems from problems.json but remove the testCases from each problem
  // const problems = jsonData.map(problem => ({
  //   _id: problem._id,
  //   id: problem.id,
  //   title: problem.title,
  //   // statement: problem.statement,
  //   // examples: problem.examples,
  //   // inputFormat: problem.inputFormat,
  //   // outputFormat: problem.outputFormat,
  //   difficulty: problem.difficulty
  // }));
  // res.json(problems);
});

router.get('/:id', async(req, res) => {
    const id = req.params.id;
    // const problem = await Problem.findOne({id});
    // const problem={title:"Sum of Two Numbers", statement:"return sum of numbers", examples:[{input:"1 2", output:"3"}]};
    //get problem from problems.json
    // const CompleteProblem=jsonData.find(problem=>problem.id===id);
    const CompleteProblem=await Problem.findOne({id});    
    const problem={
      _id:CompleteProblem._id,
      id:CompleteProblem.id,
      title:CompleteProblem.title,
      statement:CompleteProblem.statement,
      examples:CompleteProblem.examples,
      inputFormat:CompleteProblem.inputFormat,
      outputFormat:CompleteProblem.outputFormat,
      difficulty:CompleteProblem.difficulty
    }
    if(!problem)  return res.status(404).json({error: "Problem not found"});
    res.json(problem);
});
router.post('/:id/run', auth, async (req, res) => {
    const {code, language, input} = req.body;
    try{
      const runResult = await axios.post(process.env.COMPILER_URL, {
        code, language, input
      });
      res.json(runResult.data);
    }catch(error){
      // console.log(error);
      console.error(error.response.data || error.message || error);
      res.status(500).json(error.response.data || error.message || error);
    }
});
router.post('/:id/submit', auth, async (req, res) => {
    const userId = req.user.id
    const probId = req.params.id;

    const {code, language} = req.body;
    if(!code || !language) return res.status(400).json({error: "Code and language are required"});
    const problem = await Problem.findOne({id:probId});
    const {testCases, timeLimit} = problem;
    console.log(testCases);
    if(!problem) return res.status(400).json({error: "Problem not found"});
    try{
      const result = await axios.post(process.env.VERDICT_URL, {code, language, testCases});
      const {compilationSuccess, verdict, totalTime} = result.data;
      console.log(compilationSuccess, verdict, totalTime);
      const submission={
        problemId:problem._id,
        probId,
        userId,
        code, language,
        datetime: new Date(),
        compilationSuccess,
        verdict: verdict,
        totalTime: totalTime,
      }
      console.log(submission);
      const newSubmission = new Submission(submission);
      await newSubmission.save();
      res.json(newSubmission);
    }catch(error){
      console.error(error);
      res.status(500).json(error);
    }
});

// AI routes
router.post('/:id/decomment', auth, async (req, res) => {
  const {code, language=""} = req.body;
    try{
      const decommentedCode = await axios.post(process.env.DECOMMENT_URL, {
        code, language
      });
      res.json(decommentedCode.data);
    }catch(error){
      console.error(error.response.data);
      res.status(500).json(error.response.data);
    }
});
router.post('/:id/reformat', auth, async (req, res) => {
    const {code, language=""} = req.body;
    try{
      const reformatedCode = await axios.post(process.env.REFORMAT_URL, {
        code, language
      });
      res.json(reformatedCode.data);
    }catch(error){
      console.error(error.response.data);
      res.status(500).json(error.response.data);
    }
});
export default router;