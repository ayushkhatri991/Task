
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
  }


}, { timestamps: true });

const taskModel = mongoose.model("Task", taskSchema);
export default taskModel;
