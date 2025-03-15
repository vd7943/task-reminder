import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  taskName: { type: String, required: true },
  taskDescription: String,
  taskLink: String,
  srNo: { type: Number, required: true },
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
  tasks: {
    type: [TaskSchema],
    validate: {
      validator: function (tasks) {
        const srNos = tasks.map((task) => task.srNo);
        return srNos.length === new Set(srNos).size; // Ensures all srNos are unique
      },
      message: "Duplicate Sr No. found! Please assign a unique Sr No.",
    },
  },
  status: { type: String, enum: ["Active", "Paused"], default: "Paused" },
  createdAt: { type: Date, default: Date.now },
});

const Plan = mongoose.model("Plan", planSchema);
export default Plan;
