import express from 'express'  //using this express we will create a router     
import userAuth from '../middleware/userAuth.js';
import { getUserData } from '../controllers/userController.js';

const userRouter = express.Router();//now we have created a router
//using this router we will create an endpoint

userRouter.get('/data', userAuth ,getUserData)// add middleware userauth
export default userRouter;
//now we have to add this user router in server.js file