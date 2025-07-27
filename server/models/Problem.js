import mongoose from "mongoose";
const { Schema } = mongoose;
const problemSchema = new Schema({
    //title, statement, examples, testcases, difficulty
    id: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    statement: {
        type: String,
        required: true,
    },
    examples: {
        type: Array,
        required: false,
    },
    inputFormat:{
        type: String, required:false,
    },
    outputFormat:{
        type: String, required:false,
    },
    // time limit in ms, memory limit in kilo bytes
    timeLimit:{
        type: Number, required:false,
    },
    memoryLimit:{
        type: Number, required:false,
    },
    testCases: {
        type: Array,
        required: false,
    },
    difficulty: {
        type: String,
        required: false,
    },
});
export default mongoose.model("Problem", problemSchema);