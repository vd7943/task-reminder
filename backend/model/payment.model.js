import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  razorpay_order_id: String,
  razorpay_payment_id: String,
  razorpay_signature: String,
  amount: Number,
  status: { type: String, enum: ["success", "failed"], default: "success" },
  createdAt: {
    type: Date,
    default: () => {
      const now = new Date();
      return new Date(now.getTime() + 5.5 * 60 * 60 * 1000); // Convert UTC to IST
    },
  },
});

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
