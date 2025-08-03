import express from 'express'
import { register ,login ,logout } from '../controllers/authController.js';

//create router named authrouter
const authRouter = express.Router();//in the router w'll add diff endpoints


authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);

export default authRouter;