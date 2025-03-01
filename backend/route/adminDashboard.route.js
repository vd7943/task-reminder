import express from "express";
import { getDashboardStats } from "../controller/adminDashboard.controller.js";

const router = express.Router();

router.get("/get-user-data", getDashboardStats);

export default router;
