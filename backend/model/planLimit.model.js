import mongoose from "mongoose";

const PlanLimitSchema = new mongoose.Schema({
  limit: { type: Number, required: true, default: 1 },
});

const PlanLimit = mongoose.model("PlanLimit", PlanLimitSchema);
export default PlanLimit;
