import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { sendEmail } from "../utils/email.util.js";
import { findBestAssignee } from "../utils/assignment.util.js";

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

    // Use the shared assignment utility to find the best user
    const selectedUser = await findBestAssignee({
      skills,
      priority,
      excludeUserIds: []
    });

    if (!selectedUser) {
      return res.status(400).json({
        success: false,
        message: "No eligible users available to assign the task.",
      });
    }

    // Create task with assignedAt for the 8-hour reassignment timer
    const task = await Task.create({
      title,
      description,
      assignedTo: selectedUser._id,
      estimatedHours,
      priority,
      status: "pending",
      skills: skills || [],
      assignedAt: new Date()
    });

    await task.populate("assignedTo", "name email");

    // Add Notification
    const notificationMessage = `You have a new ${priority} priority task: ${title}`;
    await Notification.create({
      userId: selectedUser._id,
      message: notificationMessage,
      taskId: task._id
    });

    // Send email notification (non-blocking)
    sendEmail(
      selectedUser.email,
      "New Task Assigned",
      notificationMessage
    ).catch(err => console.error("Failed to send email non-blocking:", err));

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

    // Prevent modifying a completed task
    if (task.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed tasks cannot be modified",
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
