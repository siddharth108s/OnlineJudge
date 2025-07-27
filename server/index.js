import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

import UserRoutes from "./routes/UserRoutes/UserRoutes.js"
import ProblemRoute from "./routes/ProblemRoutes/ProblemRoutes.js"
import SubmissionRoute from "./routes/SubmissionRoutes/SubmissionRoutes.js"
import DBConnect from "./database/DBConnection.js"

const app = express()
const port = 3000
try{
  await DBConnect();
  console.log("MongoDB Connected Successfully!");
}catch(error){
  console.log("Error connecting to database");
}
app.use(cors({
  origin: ["http://localhost:5173","http://localhost:5174", "http://localhost:4173", "http://localhost:4174", "http://localhost:4175", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:4173", "http://127.0.0.1:4174", "http://127.0.0.1:4175", "https://bytejudge.sidhere.tech", "http://bytejudge.sidhere.tech"],
  credentials: true,
}));
// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/user', UserRoutes);
app.use('/problems', ProblemRoute);
app.use('/stats', SubmissionRoute);

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`)
})