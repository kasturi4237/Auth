import './config/env.js';
import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import cors from "cors";


import cookieParser from "cookie-parser";
import connnectDB from "./config/mongodb.js";
import authRouter from './routes/authRoutes.js';


const app=express();
const port=process.env.PORT ||4000
connnectDB();


app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials:true}))

//API enpoints
app.get('/',(req,res)=>res.send("API Working fine"));
app.use('/api/auth',authRouter)
app.listen(port,()=>console.log(`Server started on PORT:${port}`));