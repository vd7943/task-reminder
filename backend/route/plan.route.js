import express from "express";
import {
  addMilestone,
  addNewPlan,
  getAllPlans,
  getMilestones,
  getPlans,
  getTodayPlans,
  optForPlan,
} from "../controller/plan.controller.js";

const router = express.Router();

router.post("/add-plan", addNewPlan);
router.post("/opt-plan", optForPlan);
router.get("/get-plan/:role/:userType", getAllPlans);
router.get("/get-user-plan/:id", getPlans);
router.get("/get-today-plan/:id", getTodayPlans);
router.post("/milestones", addMilestone);
router.get("/milestones/:userId", getMilestones);

export default router;
