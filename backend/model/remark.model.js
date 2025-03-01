import mongoose from "mongoose";

const remarkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  taskName: { type: String, required: true },
  taskDuration: { type: Number, required: true },
  taskReview: { type: Number, required: true },
  taskSummary: { type: String, required: true },
  createdAt: {
    type: Date,
    default: () => {
      const now = new Date();
      return new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    },
  },
});

const Remark = mongoose.model("Remark", remarkSchema);
export default Remark;
