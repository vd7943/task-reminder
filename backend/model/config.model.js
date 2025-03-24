import mongoose from "mongoose";

const configSchema = new mongoose.Schema({
  userTypes: {
    Custom: { type: String, default: "Custom" },
    Manage: { type: String, default: "Manage" },
  },
  createdAt: {
    type: Date,
    default: () => {
      const now = new Date();
      return new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    },
  },
});

const Config = mongoose.model("Config", configSchema);
export default Config;
