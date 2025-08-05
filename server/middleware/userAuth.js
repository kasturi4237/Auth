import jwt from "jsonwebtoken";
//after executing this func it will perform next func in next it will execute controller func
const userAuth = async (req,res,next) =>{
    const {token} = req.cookies;//it will find the token from  req.cookies

    if(!token){
        return res.json({success: false, message: 'Not Authorized Login Again'})

    }
     //if token is available
    try {
        //first we will decode the token
        const tokenDecode = jwt.verify(token, procees.env.JWT_SECRET);
        //from this decodetoken we have to find id bz for creating the token we have to use the id
        if(tokenDecode.id){
            //it will add this id in req body with the property userid
            req.body.userId = tokenDecode.id

        }else{
            return res.json({success: false, message: 'Not Authorized Login Again'}) ;//if no tokenid
        }

        next()
        
    } catch (error) {
       res.json({success:false,message: error.message}); 
    }

}

export default userAuth;
//using this middleware and controller function we will create the api endpoints lets open authroutes.js