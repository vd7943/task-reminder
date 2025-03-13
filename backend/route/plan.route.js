import express from "express";
import {
  addMilestone,
  addNewPlan,
  getAllPlans,
  getMilestones,
  getPlanById,
  getPlans,
  getTodayPlans,
  optForPlan,
  updatePlanStart,
  updateTask,
  updatePlanStatus,
  getCoinsEarnedForPlan,
  restartPlan,
} from "../controller/plan.controller.js";

const router = express.Router();

router.post("/add-plan", addNewPlan);
router.post("/opt-plan", optForPlan);
router.get("/get-plan/:role/:userType", getAllPlans);
router.get("/get-user-plan/:id", getPlans);
router.get("/get-today-plan/:id", getTodayPlans);
router.post("/milestones", addMilestone);
router.get("/milestones/:userId", getMilestones);
router.get("/:id", getPlanById);
router.get("/coins-earned/:id", getCoinsEarnedForPlan);
router.put("/update-plan-start/:id", updatePlanStart);
router.put("/update-task/:planId/:taskId", updateTask);
router.put("/update-plan-status/:id", updatePlanStatus);
router.put("/restart-plan", restartPlan);

export default router;
