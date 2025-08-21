import userModel from "../models/userModel";
export const getUserData =async  (req,res)=>{
    try {
        //first find the user using the userid,we'll get it from req.body
        const {userId} = req.body;
        //this userid will be added in the body using the middleware that we have already seen
        //now find the user in the database using this userid
        const user = await userModel.findById(userId);
        if(!user){
             res.json({ success: false ,message: 'User not found'});    
        }

        //user is avail
        res.json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified //we'll geteither true or false
            },
            
        })



        
    } catch (error) {
        res.json({ success: false ,message: error.message});    
    }
}

//using this controller function we havve to create a route