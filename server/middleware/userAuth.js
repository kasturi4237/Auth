import jwt from "jsonwebtoken";
//after executing this func it will perform next func in next it will execute controller func
const userAuth = async (req,res,next) =>{
    const {token} = req.cookies;//it will find the token from  req.cookies

    if(!token){
        return res.json({success: false, message: 'Not Authorized Login Again'})

    }

    try {
        
    } catch (error) {
        
    }

}