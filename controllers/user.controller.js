import userSchema from "../models/user.model.js"
import bcrypt from "bcryptjs";

export const getAllUsers = async(req, res) =>{
    try {
        const users = await userSchema.find()

        if(!users.length){
            return res.status(404).json({
                message:"Users not found",
                success:false,
            })
        }

        return res.status(200).json({
            message:"Users fetched successfully",
            success:true,
            users,
        })
        
    } catch (error) {
        return res.status(500).json({
            message:"Something went wrong",
            success:false,
        })
    }
}

export const createUser = async (req, res) => {
    try {
      const { name, email, password, role } =
        req.body;
  
  
      if (!name || !email || !password || !role) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
  
      const existingUser = await userSchema.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "User already exists",
        });
      }
  
      const newUser = await userSchema.create({
        name,
        email,
        password: hashedPassword,
        role,
      });
  
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
  };



export const getById = async (req, res) => {
    try {
      const { id } = req.params;
      const user = await userSchema.findById(id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
    
  
      return res.status(200).json({
        message: "User fetched successfully",
        success: true,
        payload:user,
      });
  
    } catch (error) {
      return res.status(500).json({
        message: "Something went Wrong",
        success: false,
      });
    }
  };
  

export const updateUser = async(req, res) =>{
    try {
        const {id} = req.params
        const {name, email, password} = req.body

        if(!name || !email || !password){
            return res.status(400).json({
                message:"All fields are required",
                success: false,
            })
        }

        const user = await userSchema.findById(id)

        if(!user){
            return res.status(404).json({
                message:"User Not Found",
                success:false,
            })
        }

        const salt = bcrypt.genSaltSync(10)
        const hashpassword = bcrypt.hashSync(password, salt)

        const updatedUser = await userSchema.findByIdAndUpdate(id,{
            name,
            email,
            password:hashpassword,
        }, { new: true })

        return res.status(200).json({
            message:"User Updated Successfully",
            success:true,
            user:updatedUser,
        })
        
    } catch (error) {
        return res.status(500).json({
            message:error.message,
            success:false,
        })
    }
}

export const deleteUser = async(req, res) =>{
    try {
        const {id} = req.params;
        const user = await userSchema.findById(id)

        if(!user){
            return res.status(404).json({
                message:"User Not Found",
                success:false,
            })
        }

        await userSchema.findByIdAndDelete(id)

        return res.status(200).json({
            message:"User Deleted Successfully",
            success:true,
        })
        
    } catch (error) {
        return res.status(500).json({
            message:error.message,
            success:false,
        })
    }
}