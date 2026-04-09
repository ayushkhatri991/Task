import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// mongoose url from .env file
const Url = process.env.MONGO_URL

const connectionDB = async () => {
    try {
        await mongoose.connect(Url);
        console.log("Database Connected Successfully...");
    } catch (err) {
        console.log(err || "Something went Wrong");
    }
};

export default connectionDB