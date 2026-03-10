import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// mongoose url from .env file
const Url = process.env.MONGO_URL

const connectionDB =() =>{
    mongoose.connect(Url)
    .then(() => console.log("Databse Connected Successfully..."))
    .catch((err) => console.log(err ||  "Something went Wrong"))
}

export default connectionDB