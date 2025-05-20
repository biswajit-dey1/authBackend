import mongoose from "mongoose";


const connectDb = () =>{
    mongoose.connect(process.env.MONGODB_URL)
    .then(() =>{
        console.log("Database Connected Succesfully")
    })
    .catch((err) =>{
        console.log("Error in connecting in database", err)
    })
}

export default connectDb