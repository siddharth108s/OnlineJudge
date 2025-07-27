import express from "express"
import Submission from "../../models/Submission.js";
import Problem from "../../models/Problem.js";
import User from "../../models/User.js";
import auth from "../../middleware/auth.js";
const router = express.Router();

router.get('/submissions', auth, async (req, res) => {
  // res.send('Get all submissions');
  const userId = req.user.id;
  let submissions = await Submission.find({userId: userId});
  // append problem title to each submission
  let submissionsWithTitles = [];
  for(let i=0;i<submissions.length;i++){
    const problem = await Problem.findOne({_id: submissions[i].problemId});
    submissionsWithTitles.push({...submissions[i]._doc, title: problem.title});
  }
  submissions = submissionsWithTitles;
  console.log(submissions);
  res.json(submissions);
});
router.get('/website-stats', async (req, res) => {
  const stats = {
    totalSubmissions: await Submission.countDocuments(),
    totalUsers: await User.countDocuments(),
    totalProblems: await Problem.countDocuments(),
  }
  res.json(stats);
});
router.get('/dashboard-stats', auth, async (req, res) => {
  const userId = req.user.id;
  // console.log(userId);
  const submissions = await Submission.find({userId: userId});
  const stats = {
    totalSubmissions: submissions.length,
    compilationAccuracy: submissions.filter(submission => submission.compilationSuccess === true).length / submissions.length,
   }
  res.json(stats);
});

export default router;