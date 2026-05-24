
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  status: {
    type: String,
    enum: ["pending","in-progress","completed"],
    default: "pending"
  },
  priority:{
    type:String,
    enum:["low","medium","high"],
    default:"medium"
  },
  estimatedHours: {
    type: Number,
    required: true
  },

  // When task actually started
  startedAt: {
    type: Date
  },

  //  When task completed
  completedAt: {
    type: Date
  },

  skills: {
    type: [String],
    default: []
  },

  // When task was assigned/reassigned to current user (starts the 8-hour timer)
  assignedAt: {
    type: Date,
    default: Date.now
  },

  // How many times this task has been auto-reassigned (max 3)
  reassignCount: {
    type: Number,
    default: 0
  },

  // Users who were previously assigned this task (excluded from future reassignment)
  previousAssignees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]

}, { timestamps: true });

const taskModel = mongoose.model("Task", taskSchema);
export default taskModel;
