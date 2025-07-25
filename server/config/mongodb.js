import mongoose from "mongoose"

const connnectDB=async()=>{

    mongoose.connection.on('connected',()=>console.log("Database Connected"))
    await mongoose.connect(`${process.env.MONGODB_URI}/mernAuth`)
};
export default connnectDB;