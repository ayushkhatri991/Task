import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
name:{
    type:String,
    required:true,

},
password:{
    type:String,
    required:true,
    min:6,
    select:false
},

email:{
    type:String,
    required:true,
    unique:true
},
role:{
    type: String,
    enum: ["admin", "employee"],
    default: "employee",
},

active: {
    type: Boolean,
    default: false
},
passwordResetToken: String,
passwordResetExpires: Date,
},{timestamps:true}
)

const userModel = mongoose.model("User",userSchema)

export default userModel