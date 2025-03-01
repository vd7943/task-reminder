import mongoose from "mongoose";

const addReminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  taskName: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ["Meeting", "Gym", "Diet", "Medical", "Other"],
  },
  reminderDateTime: { type: Date, required: true },
  scheduleDateTime: { type: Date, required: true },
  taskDuration: { type: Number, required: true },
  taskDescription: { type: String, required: true },
});

const AddReminder = mongoose.model("AddReminder", addReminderSchema);
export default AddReminder;
