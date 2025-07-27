import express from "express"
import bcrypt from "bcryptjs";
import User from "../../models/User.js"
import jwt from "jsonwebtoken"
import process from "process"
import DBConnect from "../../database/DBConnection.js";
import mongoose from "mongoose";
import auth from "../../middleware/auth.js";
const router = express.Router();

const failureSender = (isSuccessful, msg, res)=>{
  return res.status(400).json({
    success:isSuccessful,
    message:msg
  });
}
router.post('/login', async (req, res) => {
  //reconnect mongodb if disconnected
  try{
    if(mongoose.connection.readyState === 0){
      console.log("MongoDB Disconnected, reconnecting...");
      await DBConnect();
      console.log("MongoDB Connected Successfully!");
    }else{
      console.log("MongoDB Already Connected!");
    }
  }catch(error){
    console.log("Error connecting to database");
    console.log(error);
  }
  const {email, password}=req.body;
  if(!email || !password){
    return failureSender(false, "Incomplete details sent.", res);
  }
  const user = await
    User.findOne({email:email.toLowerCase()});
  if(!user){
    return failureSender(false, "Email does not exist", res);
  }

  const isValidPassword=await bcrypt.compare(password, user.password);
  if(!isValidPassword)
    return failureSender(false, "Invalid email password combination.", res);
  const token = jwt.sign({
    id:user._id,
    email:user.email,
    name:user.name
  }, process.env.JWT_SECRET);
  console.log("login successful");
  const cookieOptions = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    httpOnly: true,
    // secure: process.env.NODE_ENV === 'production',
    // sameSite: 'strict'
    secure: true,
    sameSite: 'none'
  };
  res.status(200).cookie("token", token, cookieOptions).json({
    success: true,
    message: "Login successful!",
    token
  })
});

router.post('/register', async (req, res) => {
    const {email, name, password} = req.body || {};
    if(!(email && name && password)){
      return failureSender(false, "Incomplete details sent.", res);
    }
    const existingUser = await
      User.findOne({email:email.toLowerCase()});
    if(existingUser){
      return failureSender(false, "Email already exists", res);
    }
    //hash create sign send
    const hashedPassword = await bcrypt.hash(password,10);
    const user = await User.create({
      email:email.toLowerCase().trim(),
      password:hashedPassword,
      name:name.trim()
    });
    const token = jwt.sign({
      id:user._id,
      email:user.email,
      name:user.name
    }, process.env.JWT_SECRET);
    res.status(201).json({
      success:true,
      message:"Registration successful",
      token
    })
});

router.get('/me', auth, (req, res) => {
  res.json({ success: true, user: { id: req.user.id, email: req.user.email, name: req.user.name } });
});

// router.get('/me', (req, res) => {
//   const token = req.cookies.token;
//     // console.log(token);
//     if (!token) return res.status(401).json({ success: false, message: "No token, authorization denied" });
//     try {
//       const payload = jwt.verify(token, process.env.JWT_SECRET);
//       res.json({ success: true, user: { id: payload.id, email: payload.email, name: payload.name } });
//     } catch(error) {
//       console.log(error);
//       res.status(401).json({ success: false, message: "Token is not valid" });
//     }
// });

export default router;