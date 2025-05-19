import mongoose from "mongoose";
import fs from "fs";
import path from "path";

const filePath = path.resolve("config/userTypes.json");

const getUserTypeEnum = () => {
  try {
    const data = JSON.parse(fs.readFileSync(filePath));
    return data.userTypes || ["Regular"];
  } catch {
    return ["Regular"];
  }
};

const userSchema = mongoose.Schema({
  profileImage: {
    public_id: { type: String, default: "" },
    url: {
      type: String,
      default:
        "https://res.cloudinary.com/dqidhk8pc/image/upload/v1740731061/imageHolder_lq90d4.jpg",
    },
  },
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: null },
  role: {
    type: String,
    enum: ["Admin", "User"],
    default: "User",
  },
  userType: {
    type: String,
    default: "Regular",
    validate: {
      validator: function (value) {
        const allowedTypes = getUserTypeEnum();
        return allowedTypes.includes(value);
      },
      message: (props) => `${props.value} is not a valid user type.`,
    },
  },
  payments: [
    {
      razorpay_order_id: String,
      razorpay_payment_id: String,
      amount: Number,
      status: { type: String, enum: ["success", "failed"], default: "success" },
      createdAt: {
        type: Date,
        default: () => {
          const now = new Date();
          return new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
        },
      },
    },
  ],
  subscriptionEndDate: { type: Date, default: null },
  coins: {
    type: Number,
    default: 0,
    min: 0,
  },
  notifications: [
    {
      message: String,
      date: { type: Date, default: Date.now },
      read: { type: Boolean, default: false },
    },
  ],
  isDeactivated: { type: Boolean, default: false },
  previousUserType: { type: String, default: "Regular" },
  emailTime: { type: String, default: "08:00" },
  lastEmailSentAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: () => {
      const now = new Date();
      return new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    },
  },
});

const User = mongoose.model("User", userSchema);

export default User;
