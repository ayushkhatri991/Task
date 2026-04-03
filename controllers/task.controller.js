import Task from "../models/task.model.js";
import User from "../models/user.model.js";

// Priority weights for sorting
const PRIORITY_WEIGHT = { high: 3, medium: 2, low: 1 };

export const getPriorityQueue = async (req, res) => {
  try {
    // Get all pending and in-progress tasks
    const tasks = await Task.find({
      status: { $in: ["pending", "in-progress"] }
    }).populate("assignedTo", "name email");

    if (!tasks.length) {
      return res.status(404).json({
        success: false,
        message: "No tasks in queue"
      });
    }

    // Sort by priority weight (high -> medium -> low)
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
    const { title, description, estimatedHours, priority } = req.body;

    if (!title || !description || !estimatedHours) {
      return res.status(400).json({
        success: false,
        message: "Title, description and estimatedHours are required",
      });
    }

    // Find all active users
    const users = await User.find({ role: "employee", active: true });

    if (!users.length) {
      return res.status(400).json({
        success: false,
        message: "No active users available",
      });
    }

    // Pick the first user who has no pending task
    let selectedUser = null;

    for (let user of users) {
      const existingTask = await Task.findOne({
        assignedTo: user._id,
        status: "pending"
      });

      if (!existingTask) {
        selectedUser = user;
        break;
      }
    }

    // If no user is available
    if (!selectedUser) {
      return res.status(400).json({
        success: false,
        message: "All users already have a pending task",
      });
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      assignedTo: selectedUser._id,
      estimatedHours,
      priority: priority || "medium",
      status: "pending"
    });

    //  Send response
    return res.status(201).json({
      success: true,
      message: "Task assigned successfully",
      assignedTo: selectedUser.name,
      task,
    });

  } catch (error) {
    console.error("Error creating task:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
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

    const now = new Date();

    const elapsedHours = (now - task.startedAt) / (1000 * 60 * 60);

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
