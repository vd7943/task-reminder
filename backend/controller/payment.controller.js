import Payment from "../model/payment.model.js";
import User from "../model/user.model.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { config } from "dotenv";

config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

export const buySubscription = async (req, res) => {
  try {
    if (!req.body.amount) {
      return res
        .status(400)
        .json({ success: false, message: "Amount is required" });
    }
    const options = {
      amount: req.body.amount * 100, // Convert to paisa
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
    };

    const order = await razorpayInstance.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      amount,
    } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const nowIST = new Date();
    nowIST.setHours(nowIST.getHours() + 5);
    nowIST.setMinutes(nowIST.getMinutes() + 30);

    let subscriptionEndDate = new Date(nowIST);
    if ([100, 200].includes(amount)) {
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1); // Monthly
    } else if ([700, 1400].includes(amount)) {
      subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1); // Yearly
    }

    let userType = "Regular";
    if ([200, 1400].includes(amount)) {
      userType = "Custom";
    } else if ([100, 700].includes(amount)) {
      userType = "Manage";
    }

    const paymentData = {
      razorpay_order_id,
      razorpay_payment_id,
      amount,
      status: "success",
      createdAt: nowIST,
    };

    await User.findByIdAndUpdate(
      userId,
      { $push: { payments: paymentData }, userType, subscriptionEndDate },
      { new: true }
    );

    const payment = new Payment({
      userId: user._id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount: req.body.amount,
      status: "success",
      createdAt: nowIST,
    });
    await payment.save();
    res.json({
      success: true,
      message: "Payment verified and stored successfully",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
