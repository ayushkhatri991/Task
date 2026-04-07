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

    // Get active employees
    const users = await User.find({ role: "employee", active: true });

    if (!users.length) {
      return res.status(400).json({
        success: false,
        message: "No active users available",
      });
    }

    let selectedUser = null;
    let minWorkload = Infinity;

    //  If HIGH priority → assign to FREE user first
    if (priority === "high") {
      for (let user of users) {
        const existingTask = await Task.findOne({
          assignedTo: user._id,
          status: { $in: ["pending", "in-progress"] }
        });

        if (!existingTask) {
          selectedUser = user;
          break;
        }
      }
    }

    // If no free user OR not high priority → GREEDY
    if (!selectedUser) {
      for (let user of users) {
        const tasks = await Task.find({
          assignedTo: user._id,
          status: { $in: ["pending", "in-progress"] }
        });

        const workload = tasks.reduce(
          (sum, task) => sum + task.estimatedHours,
          0
        );

        if (workload < minWorkload) {
          minWorkload = workload;
          selectedUser = user;
        }
      }
    }

    // Step 4: Create task
    const task = await Task.create({
      title,
      description,
      assignedTo: selectedUser._id,
      estimatedHours,
      priority,
      status: "pending"
    });

    await task.populate("assignedTo", "name email");

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
