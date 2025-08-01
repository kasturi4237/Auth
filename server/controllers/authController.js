import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';



export const register=async(req,res)=>{
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
        await user.save();//user has been created
        // next we have to generate one token for authentication and we will send this token using the cookies 
        //first generate the token using jwt
        const token=jwt.sign({id: user._id},process.env.JWT_SECRET,{expiresIn:'7d'});// we will provide user id 
        //when a new user is created in the mongodb database then in mongobd it generates one id automatically
        //we can create our secret jwt string
        //we will add the expiry toten ..this token expires in 7 days like this
        //we have generated this token using user id and expires in 7 days
        //after generating this token we have to send this token to user in the response and in it we will add the cookie so using the cookie we will send this token
        res.cookie('token',token{//we will add value token and in this create an object and in it provide some properties 
            httpOnly: true ;//only http request can access this cookie
            
            
            secure:process.env.NODE_ENV === 'production'
            //whenever we will run this project on live server then it will run on https then it will be true and when running on local envinment it will run on http i.e not secure so it will be false to make this statement true or false will use the environment variable(add env variable node_env in .env file)
            sameSite:process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            //for local env =strict bez in local dev backend and frontend both will also run on local host(same env so strict)but when deploying it on live server we can write our backend in another domain nameand if frontend is running in another domain name there (none)
            maxAge:7*24*60*60*1000 //(in milisec)
        }) //now we have created the user registration controller function
        
        return res.json({success: true});



    } catch(error){
        res.json({success: false, message : error.message})
    }
}


//now create controller func for user login
export const login=async (req,res)=>{
    const {email,password}=req.body;

    if(!email || !password){
        return res.json({success : false, message: 'Email and password are required'})
    }
    try{
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success : false, message: 'Invalid email'})
        }

        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.json({success : false, message: 'Invalid password'})
        }
        //password is matching then->
        //generate one token ,using this token user will be authenticatedand loged in the website(to generate token use same line)

        const token=jwt.sign({id: user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
    
        res.cookie('token',token{
            httpOnly: true ;
            secure:process.env.NODE_ENV === 'production'
            sameSite:process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge:7*24*60*60*1000 
        });
        return res.json({success: true});//bz user is successfully logged in



    } catch(error){
        return res.json({success: false, message : error.message});
    }
}

//create log out controller function
export const logout= async (req,res)=>{
    try {
        res.clearCookie('token',{
            httpOnly: true ;
            secure: process.env.NODE_ENV === 'production'
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7*24*60*60*1000 
        })
         return res.json({success: true, message : "Logged Out"});
    } catch (error) {
       return res.json({success: false, message : error.message});
    }
}

// we need to create api end point using this controller funcs for this we need routes