import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';



export cont register=async(req,res)=>{
    const {name,email,password}=req.body;

    if{name,email,password}=req.body;

    if(!name||!eamil || !password ){
        return res.json({success:false,message:'Missing Details'})

    }

    try{
        const existingUser=await userModel.findOne({email})

        if(existingUser){
            return res.json({success:false,message:"User already exist"});
        }
        const hashedPassword=await bcrypt.hash(password,10);

        const user=new userModel({name,email,password:hashedPassword});
        
    }
}