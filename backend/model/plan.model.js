import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  taskName: { type: String, required: true },
  taskDescription: String,
  taskLink: String,
  srNo: Number,
  days: { type: String, required: true },
  schedule: [
    {
      date: { type: String, required: true },
      time: { type: String, required: true, default: "00:01" },
    },
  ],
});

const planSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userRole: { type: String, required: true },
  planName: { type: String, required: true },
  planStart: String,
  tasks: [TaskSchema],
  status: { type: String, enum: ["Active", "Paused"], default: "Paused" },
  createdAt: { type: Date, default: Date.now },
});

const Plan = mongoose.model("Plan", planSchema);
export default Plan;
