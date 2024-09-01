import mongoose from "mongoose";

const connectDB = async() =>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.DB_URI}/SecureX`);
        console.log(`MongoDB connected !! DB Host : ${connectionInstance.connection.host}`);
    }catch (error){ 
        console.error(`Error : ${error.message}`);
        process.exit(1);
    }
};

export { connectDB };