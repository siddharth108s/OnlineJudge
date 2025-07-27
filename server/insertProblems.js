import fs from 'fs';
import mongoose from 'mongoose';
import Problem from './models/Problem.js';
import DBConnect from './database/DBConnection.js';

/**
 * Deletes all existing problems and then inserts all problems from problems.json.
 * This is useful for a clean slate.
 */
const repopulateProblems = async () => {
  try {
    await DBConnect();
    console.log('MongoDB Connected Successfully for script!');

    console.log('Deleting all existing problems...');
    const deleteResult = await Problem.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} problems.`);

    const problemsData = JSON.parse(fs.readFileSync('problems.json', 'utf-8'));

    console.log('Inserting all problems from problems.json...');
    await Problem.insertMany(problemsData);
    console.log(`Successfully inserted ${problemsData.length} problems.`);

  } catch (error) {
    console.error('Error repopulating problems:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
};

/**
 * Inserts only the problems from problems.json that do not already exist in the database.
 * It checks for existence based on the problem 'id'.
 */
const insertNewProblems = async () => {
  try {
    await DBConnect();
    console.log('MongoDB Connected Successfully for script!');

    const problemsData = JSON.parse(fs.readFileSync('problems.json', 'utf-8'));
    let newProblemsCount = 0;

    for (const problem of problemsData) {
      const existingProblem = await Problem.findOne({ id: problem.id });
      if (!existingProblem) {
        await Problem.create(problem);
        console.log(`Inserted new problem: "${problem.title}"`);
        newProblemsCount++;
      } else {
        console.log(`Skipping existing problem: "${problem.title}"`);
      }
    }

    console.log(`Finished. Inserted ${newProblemsCount} new problems.`);

  } catch (error) {
    console.error('Error inserting new problems:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
};


// To run one of these functions, you can call it here.
// For example, to add only new problems:
insertNewProblems();

// Or, to delete everything and re-insert:
// repopulateProblems();

// The original file called a function directly.
// I am leaving them commented out to prevent accidental data modification.
// Please uncomment the function you wish to run.