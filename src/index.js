import connectDB from './db/index.js'
// import 'dotenv/config'
import dotenv from 'dotenv'

dotenv.config({
    path:'./env'
})

connectDB();

// import mongoose from 'mongoose'
// import {DB_NAME} from './constants'

// (async()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
//     } catch (error) {
//         console.log("Error: ",error);
//         throw error;
//     }
// })()