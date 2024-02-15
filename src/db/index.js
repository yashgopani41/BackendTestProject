import mongoose from 'mongoose'
import {DB_NAME} from '../constants.js'

const connectDB = async () => {
    try {
       const connection = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
        console.log(`\n MongoDB Connection Successfully!!! Running on PORT:${process.env.PORT}`)
    } catch (error) {
        console.log("MONGODB CONNECTION FAILED : ",error);
        process.exit(1)        
    }
}

export default connectDB;