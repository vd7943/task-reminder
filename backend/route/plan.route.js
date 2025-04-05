import express from "express";
import {
  addNewPlan,
  getAllPlans,
  getPlanById,
  getPlans,
  getTodayPlans,
  optForPlan,
  updateTask,
  updatePlanStatus,
  getCoinsEarnedForPlan,
  deletePlan,
  getUserMilestones,
} from "../controller/plan.controller.js";

const router = express.Router();

router.post("/add-plan", addNewPlan);
router.post("/opt-plan", optForPlan);
router.get("/get-admin-plan", getAllPlans);
router.get("/get-user-plan/:id", getPlans);
router.get("/get-today-plan/:id", getTodayPlans);
router.get("/:id", getPlanById);
router.get("/coins-earned/:id", getCoinsEarnedForPlan);
router.put("/update-task/:planId/:taskId", updateTask);
router.put("/update-plan-status/:id/:userId", updatePlanStatus);
router.delete("/delete/:userId/:planId", deletePlan);
router.get("/milestones/:userId", getUserMilestones);

export default router;
