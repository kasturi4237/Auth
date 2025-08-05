import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';


export const register=async(req,res)=>{
    const {name,email,password}=req.body;

    

    if(!name||!email || !password ){
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
        res.cookie('token',token,{
            //we will add value token and in this create an object and in it provide some properties 
            httpOnly: true , //only http request can access this cookie
            
            
            secure:process.env.NODE_ENV === 'production',
            //whenever we will run this project on live server then it will run on https then it will be true and when running on local envinment it will run on http i.e not secure so it will be false to make this statement true or false will use the environment variable(add env variable node_env in .env file)
            sameSite:process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            //for local env =strict bez in local dev backend and frontend both will also run on local host(same env so strict)but when deploying it on live server we can write our backend in another domain nameand if frontend is running in another domain name there (none)
            maxAge:7*24*60*60*1000 //(in milisec)
        }) //now we have created the user registration controller function
        




        //Sending welcome email
        const mailOptions={
            from: process.env.SENDER_EMAIL,
            to:email,
            subject:'Welcome to GreatStack',
            text: `Welcome to greatstack website. Your account has been created with email id: ${email}`
        }
        try {
      await transporter.sendMail(mailOptions);
      console.log('✅ Email sent to:', email);
    } catch (emailErr) {
      console.error('❌ Failed to send welcome email:', emailErr.message);
      // Optional: continue even if email fails
    }
        
        
        
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
    
        res.cookie('token',token,{
            httpOnly: true ,
            secure:process.env.NODE_ENV === 'production',
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
            httpOnly: true ,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7*24*60*60*1000 
        })
         return res.json({success: true, message : "Logged Out"});
    } catch (error) {
       return res.json({success: false, message : error.message});
    }
}

// we need to create api end point using this controller funcs for this we need routes



//we'll create user verfication controller function so that user can verify the email id n hence account
export const sendVerifyOtp = async (req,res)=>{
    try {
        const {userid} = req.body; //getting userId from req body
        const user = await userModel.findById(userId); //we'll get the user

        if(user.isAccountVerified){//if true
            return res.json({success: false, message: "Account Already verified"})
        }

        //if not verified
        //generate an otp
        const otp = String(math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        //now set the expiry time for otp
        user.verifyOtpExpireAt = Date.now()+ 24 * 60 * 60 * 1000;//expiry date will be 24 hrs

        //now save user in database
        await user.save();

        //after updating the user data we will send the email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject:'Account Verification otp',
            text: `Your OTP is ${otp}. Verify your account using this otp`

        }
        //now we have to send the eamil
        await transporter.sendMail(mailOptions);
        //now add response
        res.json({ success: true, message : 'Verification otp send on email'});





    } catch (error) {
        return res.json({success: false, message : error.message});
        
    }
}
//verify email using otp
export const verifyEmail = async (req,res)=>{
    const {userId,otp} = req.body;

    if(!userId || !otp){
        return res.json({success: false, message: "Missing Details"});
    }
    try {
        //find the user from the user id
        const user = await userModel.findById(userId);
        if(!user){
            return res.json({success: false, message: "User not found"});
        }
        // if user then
        if(user.verifyOtp === '' || user.verifyOtp!= otp){
             return res.json({success: false, message: "Invalid OTP"});
        }

        //if otp is valid check for expiry date
        if(user.verifyOtpExpireAt < Date.now()){
            return res.json({success: false, message: "OTP expired"});
        }
        //if otp not expired ,verify the users account
        //make the isAccountVerified true
        user.isAccountVerified = true;
        user.verifyOtp='';
        user.verifyOtpExpireAt = 0;

        await user.save();
        return res.json({success: true , message: "Email verified successfully"})

        
    } catch (error) {
        return res.json({success: false, message: "Missing Details"});
    }
}

//using these 2 controller function we have to create the api endpoints
//we need a middleware to get the cookie and from that we will get a token and from that token it will find the userId that we need in these controller function ..that user id will be added in the request body thta will be done usnig a function for that we will create a middleware



//create controller function isAuthenticated
export const isAuthenticated = async (req,res)=>{
    try {
        return res.json({success: true}); 
        
    } catch (error) {
        return res.json({success: false, message : error.message});
    }

}
//lets create api endpoints for this also open authroutes,js and add "authRouter.post('/is-auth',userAuth , isAuthenticated);"

//send password reset otp
export const sendResetOtp = async (req,res)=>{
    const {email} = req.body;

    if(!email){  
         return res.json({success: false, message : 'Email is required'});

    }
     //if email is avail we will add try catch
    try {

        const user = await userModel.findOne({email});
        if(!user){
         return res.json({success: false, message : 'User not found'});

        }  
        //user is avail, we'll generate an otp on email
        const otp = String(math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        //now set the expiry time for otp
        user.resetOtpExpireAt = Date.now()+ 15 * 60 * 60 * 1000;
        //now save user in database
        await user.save();

        //after updating the user data we will send the email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject:'Password Reset OTP',
            text: `Your OTP for resetting your password is ${otp}. Use this password to proceed with the resetting your password`

        }
        await transporter.sendMail(mailOptions);

        return res.json({success: true, message : 'OTP send to your email'});
        


    } catch (error) {
         return res.json({success: false, message : error.message});
        
    }

}

//Reset User Password
export const resetPassword = async (req,res)=>{
    const {email,otp,newPassword} = req.body;

    if(!email || !otp || !newPassword){
         return res.json({success: false, message : 'Email, OTP ,and new password are password are required'});

    }
    try {
        const user = await userModel.findOne({email});
        if(!user){
         return res.json({success: false, message : 'User not found'});
        }
        //user is avail
        if(user.resetOtp === "" || user.resetOtp != otp){
         return res.json({success: false, message : 'Invalid OTP'});

        }
        
        if(user.resetOtpExpireAt < Date.now()){
         return res.json({success: false, message : 'OTP Expired'});

        }
        //otp not expired
        //update the users password
        //user has send the new password first we have to encrypt the new password to store in the database
        const hashedPassword = await bcrypt.hash(newPassword, 10);//hashed password for the new password
        user.password = hashedPassword;//update p in user database
        user.resetOtp = '';//reset the otp
        user.resetOtpExpireAt =0 ;

        await user.save();
        return res.json({success: true, message : 'Password has been reset successfully '});

    } catch (error) {
         return res.json({success: false, message : error.message});
        
    }
}
//using this controler function we will create the api endpoints open auth routes .js 
