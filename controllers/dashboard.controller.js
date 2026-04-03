import Task from "../models/task.model.js"
import User from "../models/user.model.js"

export const adminStats = async(req,res)=>{
try{
  const totalTasks = await Task.countDocuments()

  const completed = await Task.countDocuments({
    status:"completed"
  })

  const pending = await Task.countDocuments({
    status:"pending"
  })

  const inProgress = await Task.countDocuments({
    status:"in-progress"
  })

  const employees = await User.countDocuments({
    role:"employee"
  })

  return res.json({
    totalTasks,
    completed,
    pending,
    inProgress,
    employees
  })
}catch(err){
    return res.status(500).json({
        success: false,
        message: err.message || "Something went wrong while fetching stats"
      })
}
}