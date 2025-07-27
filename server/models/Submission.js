import mongoose from "mongoose";
const { Schema } = mongoose;
const submissionSchema = new Schema({
    //problemId, userId, code, language, datetime,verdict, compilationtime;
    problemId: {
        type: Schema.Types.ObjectId,
        ref: "Problem",
        required: true,
    },
    probId: {
        type: String,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
    datetime: {
        type: Date,
        required: true,
    },
    compilationSuccess: {
        type: Boolean,
        required: false,
    },
    verdict: {
        type: Array,
        required: false,
    },
    totalTime: {
        type: Number,
        required: false,
    },
});
export default mongoose.model("Submission", submissionSchema);