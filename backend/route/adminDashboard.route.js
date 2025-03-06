import express from "express";
import {
  getDashboardStats,
  toggleUserActivation,
} from "../controller/adminDashboard.controller.js";

const router = express.Router();

router.get("/get-user-data", getDashboardStats);
router.put("/toggle-user/:userId", toggleUserActivation);

export default router;
