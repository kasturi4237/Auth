import express from 'express'
import { register ,login ,logout, sendVerifyOtp, verifyEmail, sendResetOtp, resetPassword } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js'

//create router named authrouter
const authRouter = express.Router();//in the router w'll add diff endpoints


authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);
authRouter.post('/send-verify-otp',userAuth , sendVerifyOtp);
authRouter.post('/verify-account',userAuth , verifyEmail);
authRouter.post('/is-auth',userAuth , isAuthenticated);
authRouter.post('/send-reset-otp',sendResetOtp);
authRouter.post('/reset-password',resetPassword);


export default authRouter;