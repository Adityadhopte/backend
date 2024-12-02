import mongoose from "mongoose"

const connectDB = async ()=>{

    try {

        await mongoose.connect(process.env.MONGO_URI);
        console.log('Mongoose coneccted SuccessFully');
        
    } catch (error) {
        console.log('Error..')
    }
}

export default connectDB;