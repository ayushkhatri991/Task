
import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const auth = {}

auth.register = async(req,res) =>{
    try {
        const {name, email, password} = await req.body;
        
    
        if ( !name || !email || !password) {
          res.status(400).json({
            success: false,
            message: "All fields are required",
          });
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
          res.status(409).json({
            success: false,
            message: "User already exists",
          });
        }
    
        const newUser = await userModel.create({
          name,
          email,
          password: hashedPassword,
        });
       await newUser.save();

        res.status(201).json({
          success: true,
          message: "User created successfully",
          payload: newUser,
        });
    
      } catch (err) {
        res.status(500).json({
          success: false,
          message: err.message,
        });
      }
    
}


auth.login = async (req, res) => {
  try {
    const { email, password } = await req.body;

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "User Not Found",
        success: false,
      });
    }
    
    user.active = true;
    await user.save();
      
    const passwordMatch = bcrypt.compareSync(password, user.password);


    if (!passwordMatch) {
      res.status(400).json({
        message: "Invalid Credentials",
        success: false,
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRETKEY, {
      expiresIn: "1h",
    });
    res.cookie("token", token, {
      httpOnly: true, 
      secure: false,  
      sameSite: "strict",
      maxAge:24 * 60 * 60 * 1000 
    });
    res.status(201).json({
      message: "User Logged in Successfully...",
      success: true,
      payload: {
        data: {
          email: user.email,
          name: user.name,
          _id: user._id,
        },
        token: token,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Something went Wrong!!! ",
      success: false,
    });
  }
};

//logout
auth.logout = async(req,res)=>{
  try{
    
      if (!req.user || !req.user._id) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: user not found"
        });
      }

      await userModel.findByIdAndUpdate(req.user._id, {
        active: false,
      });
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,     
      sameSite: "strict"
    });

    res.status(200).json({
      success:true,
      message:"User logged Out Successfully"
    })
  }
  catch(err){
    res.status(500).json({
      success:false,
      message:err.message || "Something went Wrong"

  })
  }
}


auth.forgotPassword = async(req,res) =>{
  try{
   const email = await req.body.email;

   const existsEmail = await userModel.findOne({email}) ;

   if(!existsEmail){
      res.status(400).json({
          message:"User not found",
          success:false
      })
   }


   const token = jwt.sign({_id:existsEmail._id},process.env.JWT_SECRETKEY,{expiresIn:"1h"})

  existsEmail.passwordResetToken  = token;
  existsEmail.passwordResetExpires = Date.now()+ 60*60*1000;
  console.log(existsEmail.passwordTokenExpiry)
  await existsEmail.save();

  const link = `${process.env.BASE_URL}/auth/change-password/${token}`;
  const transporter = nodemailer.createTransport({
      service: "gmail",
      auth:{
          user:process.env.EMAIL,
          pass:process.env.PASSWORD
      }
  })
  await transporter.sendMail({
      from:process.env.EMAIL,
      to:existsEmail.email,
      subject:"Reset Password",
      text:`Please click on the link to reset your password : ${link}`
  })
  res.status(201).json({
      success:true,
      message:"Password Reset Link Sent Successfully...",
      payload:{data:{email:existsEmail.email}}
  })
  }
  catch(err){
      res.status(501).json({
          success:false,
          message:err.message || "Failed to change password"
      })
  }
}

auth.changePassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const { token } = req.params;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
        success: false,
      });
    }

    // Decode the JWT token to extract user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);
    console.log("Decoded token:", decoded);

    // Find user with matching ID, token, and valid expiry
    const user = await userModel.findOne({
      _id: decoded._id,
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    console.log("User found:", user);

    if (!user) {
      return res.status(400).json({
        message: "Token expired or invalid",
        success: false,
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successfully",
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Something went wrong",
      success: false,
    });
  }
};

export default auth;