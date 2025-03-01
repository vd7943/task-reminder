import express from "express";
import {
  buySubscription,
  verifyPayment,
} from "../controller/payment.controller.js";

const router = express.Router();

router.post("/buy-subscription", buySubscription);
router.post("/verify-payment", verifyPayment);

export default router;
