import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

// Priority weights for sorting
const PRIORITY_WEIGHT = { high: 3, medium: 2, low: 1 };

export const getPriorityQueue = async (req, res) => {
  try {
    const tasks = await Task.find({
      status: { $in: ["pending", "in-progress"] }
    }).populate("assignedTo", "name email");

    if (!tasks.length) {
      return res.status(404).json({
        success: false,
        message: "No tasks in queue"
      });
    }

   
    const queue = tasks.sort((a, b) => 
      PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]
    );

    return res.status(200).json({
      success: true,
      message: "Priority queue fetched successfully",
      total: queue.length,
      queue
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong"
    });
  }
};

export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignedTo", "name email");
    if(!tasks.length)
    {
      return res.status(404).json({
        success: false,
        message: "No tasks found"
      })
    }
    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      tasks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
export const createTask = async (req, res) => {
  try {
    const { title, description, estimatedHours, priority, skills } = req.body;

    if (!title || !description || !estimatedHours || !priority || !skills) {
      return res.status(400).json({
        success: false,
        message: "Title,description,skills,priority and estimatedHours are required",
      });
    }

    // Get active employees
    const users = await User.find({ role: "employee", active: true });

    if (!users.length) {
      return res.status(400).json({
        success: false,
        message: "No active users available",
      });
    }

    // users based on similar skills 
    let eligibleUsers = [...users];
    if (skills && skills.length > 0) {
      const matchingUsers = users.filter((u) =>
        skills.every((skill) => u.skills.includes(skill))
      );
      
      if (matchingUsers.length > 0) {
        eligibleUsers = matchingUsers;
      } else {
        return res.status(400).json({
          success: false,
          message: "No users found with all required skills",
        });
      }
    }

let selectedUser = null;
let minWorkload = Infinity;

//High and medium priority logic
if (priority === "high" || priority === "medium") {
  for (let user of eligibleUsers) {
    const existingTask = await Task.findOne({
      assignedTo: user._id,
      status: "in-progress"
    });

    // Pick immediately if no active task
    if (!existingTask) {
      selectedUser = user;
      break;
    }
  }
}

// If no free user OR not high or medium priority → use workload
if (!selectedUser) {
  const now = new Date();

  for (let user of eligibleUsers) {
    const tasks = await Task.find({
      assignedTo: user._id,
      status: { $in: ["pending", "in-progress"] }
    });

const workload = tasks.reduce((sum, task) => {
  let remaining = Number(task.estimatedHours) || 0;

  if (task.status === "in-progress" && task.startedAt) {
    const start = new Date(task.startedAt).getTime();
    const nowTime = now.getTime();

    if (!isNaN(start) && nowTime > start) {
      const elapsed = (nowTime - start) / (1000 * 60 * 60);
      remaining = Math.max(remaining - elapsed, 0);
    }
  }

  return sum + remaining;
}, 0);

    if (workload < minWorkload) {
      minWorkload = workload;
      selectedUser = user;
    }
  }
}

    // Create task
    const task = await Task.create({
      title,
      description,
      assignedTo: selectedUser._id,
      estimatedHours,
      priority,
      status: "pending",
      skills: skills || []
    });

    await task.populate("assignedTo", "name email");

    // Add Notification
    const notificationMessage = `You have a new ${priority} priority task: ${title}`;
    await Notification.create({
      userId: selectedUser._id,
      message: notificationMessage,
      taskId: task._id
    });

    // Fire Socket.io event
    if (req.io) {
      req.io.to(selectedUser._id.toString()).emit("newTask", {
        message: notificationMessage,
        task: task
      });
    }

    return res.status(201).json({
      success: true,
      message: "Task assigned (priority + greedy)",
      assignedTo: selectedUser.name,
      priority,
      task,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProgress = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    // Find the task
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Update status
    if (status) {
      task.status = status;
      
      if (status === "in-progress" && !task.startedAt) {
        task.startedAt = new Date();
      }
      
      if (status === "completed") {
        task.completedAt = new Date();
      } else {
        // If status moved back from completed, clear it
        task.completedAt = undefined;
      }
    }

    await task.save();

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });

  } catch (error) {
    console.error("Error updating task:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};



export const trackTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    if (!task.startedAt) {
      return res.status(400).json({
        success: false,
        message: "Task has not started yet"
      });
    }

    const endTime = task.status === "completed" && task.completedAt ? task.completedAt : new Date();

    const elapsedHours = (endTime - task.startedAt) / (1000 * 60 * 60);

    const remainingHours = Math.max(task.estimatedHours - elapsedHours, 0);

    const progress =
      (elapsedHours / task.estimatedHours) * 100;

    return res.status(200).json({
      success: true,
      taskId: task._id,
      status: task.status,
      elapsedHours: elapsedHours.toFixed(2),
      remainingHours: remainingHours.toFixed(2),
      progress: progress.toFixed(2) + "%"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await Task.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
