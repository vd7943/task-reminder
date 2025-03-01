import mongoose from "mongoose";

const ScheduleSchema = new mongoose.Schema({
  date: { type: String, required: true },
  time: { type: String, required: true },
});

const reminderSchema = new mongoose.Schema({
  schedule: [ScheduleSchema],
});

const planSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userRole: { type: String, required: true },
  planName: { type: String, required: true },
  reminders: [reminderSchema],
  createdAt: { type: Date, default: Date.now },
});

const Plan = mongoose.model("Plan", planSchema);
export default Plan;
